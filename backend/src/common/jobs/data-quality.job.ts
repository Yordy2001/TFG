import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { IdentityHashService } from '../security/identity-hash.service';

const CODED_FOLLOWUP_FIELDS = [
  'situacionEconomicaFamiliar',
  'apoyoFamiliarPercibido',
  'trabajaDurantePeriodoEscolar',
  'distanciaHogarEscuelaKm',
  'problemasFamiliaresReportados',
  'senalesPreviasAbandono',
] as const;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Weekly report of dataset quality: completeness of the newer coded fields,
// staleness (days since last update per student), and detected inconsistencies.
// Individuals are referenced only by estudianteHash in detalleJson, never by
// name/matricula — depends on IdentityMappingModule for that hash.
@Injectable()
export class DataQualityJobService {
  private readonly logger = new Logger(DataQualityJobService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly identityHash: IdentityHashService,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async ejecutar(): Promise<void> {
    const centros = await this.prisma.centroEducativo.findMany({ select: { id: true } });
    for (const { id: centroId } of centros) {
      await this.reporteSeguimientoOrientador(centroId);
      await this.reporteHistorialAcademico(centroId);
    }
    this.logger.log('Reportes de calidad de dato generados.');
  }

  private hashSeguro(estudianteId: string): string {
    try {
      return this.identityHash.hash(estudianteId);
    } catch {
      return 'sin-hash';
    }
  }

  private async reporteSeguimientoOrientador(centroId: string): Promise<void> {
    const seguimientos = await this.prisma.seguimientoOrientador.findMany({ where: { centroId } });
    if (seguimientos.length === 0) return;

    let camposCompletos = 0;
    const camposTotales = seguimientos.length * CODED_FOLLOWUP_FIELDS.length;
    const ahora = Date.now();
    let sumaDias = 0;

    for (const seguimiento of seguimientos) {
      for (const campo of CODED_FOLLOWUP_FIELDS) {
        if ((seguimiento as unknown as Record<string, unknown>)[campo] !== null) camposCompletos += 1;
      }
      sumaDias += (ahora - seguimiento.updatedAt.getTime()) / MS_PER_DAY;
    }

    const porcentajeCamposCompletos = Math.round((camposCompletos / camposTotales) * 100 * 100) / 100;
    const diasDesdeUltimaActualizacionPromedio = Math.round(sumaDias / seguimientos.length);

    const desactualizados = seguimientos
      .filter((s) => (ahora - s.updatedAt.getTime()) / MS_PER_DAY > 90)
      .map((s) => this.hashSeguro(s.estudianteId));

    await this.prisma.reporteCalidadDato.create({
      data: {
        centroId,
        entidad: 'SeguimientoOrientador',
        porcentajeCamposCompletos,
        diasDesdeUltimaActualizacionPromedio,
        inconsistenciasDetectadas: 0,
        detalleJson: { estudiantesDesactualizados: desactualizados },
      },
    });
  }

  private async reporteHistorialAcademico(centroId: string): Promise<void> {
    const registros = await this.prisma.historialAcademico.findMany({ where: { centroId } });
    if (registros.length === 0) return;

    const NOTA_MINIMA_APROBATORIA = 70;
    const inconsistentes = registros.filter(
      (r) => (r.reprobo && r.calificacion >= NOTA_MINIMA_APROBATORIA) || (!r.reprobo && r.calificacion < NOTA_MINIMA_APROBATORIA),
    );

    const ahora = Date.now();
    const diasDesdeUltimaActualizacionPromedio = Math.round(
      registros.reduce((acc, r) => acc + (ahora - r.calculadoEn.getTime()) / MS_PER_DAY, 0) / registros.length,
    );

    await this.prisma.reporteCalidadDato.create({
      data: {
        centroId,
        entidad: 'HistorialAcademico',
        porcentajeCamposCompletos: 100,
        diasDesdeUltimaActualizacionPromedio,
        inconsistenciasDetectadas: inconsistentes.length,
        detalleJson: {
          estudiantesConInconsistencia: inconsistentes.map((r) => this.hashSeguro(r.estudianteId)),
        },
      },
    });
  }
}
