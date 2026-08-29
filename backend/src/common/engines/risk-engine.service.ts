import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AcademicEngineService } from './academic-engine.service';
import { NivelRiesgo } from '../enums';
import { HistorialRiesgo, Riesgo } from '../interfaces/entities';

const PESOS = {
  promedioAcademico: 0.35,
  asistencia: 0.3,
  bajoRendimiento: 0.15,
  incidentes: 0.1,
  ajusteProfesional: 0.1,
};

function clasificar(porcentaje: number): NivelRiesgo {
  if (porcentaje >= 80) return NivelRiesgo.ALTO;
  if (porcentaje >= 50) return NivelRiesgo.MEDIO;
  return NivelRiesgo.BAJO;
}

/**
 * Computes the dropout-risk percentage from academic indicators.
 * Never computes averages itself — always reads them from AcademicEngine.
 */
@Injectable()
export class RiskEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly academicEngine: AcademicEngineService,
  ) {}

  private async ultimoAjuste(estudianteId: string): Promise<number> {
    const ultimo = await this.prisma.historialRiesgo.findFirst({
      where: { estudianteId },
      orderBy: { fecha: 'desc' },
    });
    return ultimo?.ajusteAplicado ?? 0;
  }

  async calcular(estudianteId: string, cursoId: string): Promise<{ porcentajeSistema: number; nivel: NivelRiesgo }> {
    const estudiante = await this.prisma.estudiante.findUnique({ where: { id: estudianteId } });
    const promedio = await this.academicEngine.promedioGeneral(estudianteId, cursoId);
    const { ausencias } = await this.academicEngine.porcentajeAsistencia(estudianteId);
    const bajoRendimientoCount = await this.academicEngine.asignaturasEnBajoRendimiento(estudianteId, cursoId);
    const totalAsignaturas = (await this.academicEngine.resultadosPorAsignatura(estudianteId, cursoId)).length || 1;

    const scorePromedio = Math.max(0, 100 - promedio); // lower average -> higher risk
    const scoreAsistencia = ausencias; // ausencias already expressed as %
    const scoreBajoRendimiento = (bajoRendimientoCount / totalAsignaturas) * 100;
    const scoreIncidentes = Math.min(100, (estudiante?.incidentesDisciplinarios ?? 0) * 25);

    const porcentajeSistema =
      scorePromedio * PESOS.promedioAcademico +
      scoreAsistencia * PESOS.asistencia +
      scoreBajoRendimiento * PESOS.bajoRendimiento +
      scoreIncidentes * PESOS.incidentes;

    const redondeado = Math.max(0, Math.min(100, Math.round(porcentajeSistema)));
    return { porcentajeSistema: redondeado, nivel: clasificar(redondeado) };
  }

  async recalcularYRegistrar(estudianteId: string, cursoId: string, centroId: string): Promise<Riesgo> {
    const { porcentajeSistema } = await this.calcular(estudianteId, cursoId);
    const ajuste = await this.ultimoAjuste(estudianteId);
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeSistema + ajuste));
    const nivel = clasificar(porcentajeFinal);
    const fecha = new Date();

    const riesgo = await this.prisma.riesgo.upsert({
      where: { estudianteId },
      create: { centroId, estudianteId, porcentaje: porcentajeFinal, nivel: nivel as never, fechaCalculo: fecha },
      update: { porcentaje: porcentajeFinal, nivel: nivel as never, fechaCalculo: fecha },
    });

    await this.registrarHistorial(estudianteId, centroId, porcentajeSistema, ajuste, null);
    return riesgo;
  }

  private async registrarHistorial(
    estudianteId: string,
    centroId: string,
    porcentajeOriginal: number,
    ajusteAplicado: number,
    usuarioId: string | null,
  ): Promise<HistorialRiesgo> {
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeOriginal + ajusteAplicado));
    return this.prisma.historialRiesgo.create({
      data: {
        centroId,
        estudianteId,
        porcentajeOriginal,
        ajusteAplicado,
        porcentajeFinal,
        nivel: clasificar(porcentajeFinal) as never,
        usuarioId,
        fecha: new Date(),
      },
    });
  }

  async aplicarAjusteProfesional(
    estudianteId: string,
    cursoId: string,
    centroId: string,
    ajuste: number,
    usuarioId: string,
  ): Promise<Riesgo> {
    const { porcentajeSistema } = await this.calcular(estudianteId, cursoId);
    const porcentajeFinal = Math.max(0, Math.min(100, porcentajeSistema + ajuste));
    const nivel = clasificar(porcentajeFinal);

    const riesgo = await this.prisma.riesgo.upsert({
      where: { estudianteId },
      create: { centroId, estudianteId, porcentaje: porcentajeFinal, nivel: nivel as never, fechaCalculo: new Date() },
      update: { porcentaje: porcentajeFinal, nivel: nivel as never, fechaCalculo: new Date() },
    });

    await this.registrarHistorial(estudianteId, centroId, porcentajeSistema, ajuste, usuarioId);
    return riesgo;
  }

  historial(estudianteId: string): Promise<HistorialRiesgo[]> {
    return this.prisma.historialRiesgo.findMany({
      where: { estudianteId },
      orderBy: { fecha: 'desc' },
    });
  }
}
