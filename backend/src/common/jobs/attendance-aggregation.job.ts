import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia, PeriodoEvaluativo } from '../enums';

const NOTA_MINIMA_APROBATORIA = 70;
const ORDEN_PERIODOS: PeriodoEvaluativo[] = [
  PeriodoEvaluativo.P1,
  PeriodoEvaluativo.P2,
  PeriodoEvaluativo.P3,
  PeriodoEvaluativo.P4,
];

interface GrupoAcademico {
  centroId: string;
  estudianteId: string;
  asignaturaId: string;
  periodoEvaluativo: PeriodoEvaluativo;
  acumulado: number;
  peso: number;
}

// Populates historial_academico and agregados_asistencia_mensual from the existing
// granular RegistroEvaluacion / AsistenciaRegistro tables. Read-only against those
// tables — only writes to the two new aggregate tables.
@Injectable()
export class AttendanceAggregationJobService {
  private readonly logger = new Logger(AttendanceAggregationJobService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async ejecutar(): Promise<void> {
    await this.actualizarHistorialAcademico();
    await this.actualizarAgregadosAsistencia();
    this.logger.log('Agregados de historial académico y asistencia actualizados.');
  }

  async actualizarHistorialAcademico(): Promise<void> {
    const registros = await this.prisma.registroEvaluacion.findMany({
      include: { actividad: { include: { asignacion: true } } },
    });

    const grupos = new Map<string, GrupoAcademico>();
    for (const registro of registros) {
      const actividad = registro.actividad;
      const asignaturaId = actividad.asignacion.asignaturaId;
      const periodoEvaluativo = actividad.periodoEvaluativo as PeriodoEvaluativo;
      const key = `${registro.estudianteId}|${asignaturaId}|${periodoEvaluativo}`;
      const grupo = grupos.get(key) ?? {
        centroId: registro.centroId,
        estudianteId: registro.estudianteId,
        asignaturaId,
        periodoEvaluativo,
        acumulado: 0,
        peso: 0,
      };
      grupo.acumulado += (registro.nota * actividad.porcentaje) / 100;
      grupo.peso += actividad.porcentaje;
      grupos.set(key, grupo);
    }

    const porEstudianteAsignatura = new Map<string, GrupoAcademico[]>();
    for (const grupo of grupos.values()) {
      const key = `${grupo.estudianteId}|${grupo.asignaturaId}`;
      const lista = porEstudianteAsignatura.get(key) ?? [];
      lista.push(grupo);
      porEstudianteAsignatura.set(key, lista);
    }

    for (const grupos of porEstudianteAsignatura.values()) {
      grupos.sort((a, b) => ORDEN_PERIODOS.indexOf(a.periodoEvaluativo) - ORDEN_PERIODOS.indexOf(b.periodoEvaluativo));

      let repitenciasAcumuladas = 0;
      for (const grupo of grupos) {
        const calificacion = grupo.peso > 0 ? Math.round((grupo.acumulado / grupo.peso) * 100 * 100) / 100 : 0;
        const reprobo = calificacion < NOTA_MINIMA_APROBATORIA;

        await this.prisma.historialAcademico.upsert({
          where: {
            estudianteId_asignaturaId_periodoEvaluativo: {
              estudianteId: grupo.estudianteId,
              asignaturaId: grupo.asignaturaId,
              periodoEvaluativo: grupo.periodoEvaluativo as never,
            },
          },
          create: {
            centroId: grupo.centroId,
            estudianteId: grupo.estudianteId,
            asignaturaId: grupo.asignaturaId,
            periodoEvaluativo: grupo.periodoEvaluativo as never,
            calificacion,
            reprobo,
            numeroVecesRepitenciaAcumulada: repitenciasAcumuladas,
          },
          update: {
            calificacion,
            reprobo,
            numeroVecesRepitenciaAcumulada: repitenciasAcumuladas,
            calculadoEn: new Date(),
          },
        });

        if (reprobo) repitenciasAcumuladas += 1;
      }
    }
  }

  async actualizarAgregadosAsistencia(): Promise<void> {
    const registros = await this.prisma.asistenciaRegistro.findMany({
      orderBy: { fecha: 'asc' },
    });

    const porEstudianteMes = new Map<
      string,
      { centroId: string; estudianteId: string; anioMes: string; registros: { fecha: string; estado: EstadoAsistencia }[] }
    >();

    for (const registro of registros) {
      const anioMes = registro.fecha.slice(0, 7);
      const key = `${registro.estudianteId}|${anioMes}`;
      const grupo = porEstudianteMes.get(key) ?? {
        centroId: registro.centroId,
        estudianteId: registro.estudianteId,
        anioMes,
        registros: [],
      };
      grupo.registros.push({ fecha: registro.fecha, estado: registro.estado as EstadoAsistencia });
      porEstudianteMes.set(key, grupo);
    }

    for (const grupo of porEstudianteMes.values()) {
      const total = grupo.registros.length;
      const presentes = grupo.registros.filter((r) => r.estado === EstadoAsistencia.PRESENTE).length;
      const porcentajeAsistenciaMensual = total > 0 ? Math.round((presentes / total) * 100 * 100) / 100 : 100;

      let rachaActual = 0;
      let rachaMaxima = 0;
      for (const registro of grupo.registros) {
        if (registro.estado === EstadoAsistencia.AUSENTE) {
          rachaActual += 1;
          rachaMaxima = Math.max(rachaMaxima, rachaActual);
        } else {
          rachaActual = 0;
        }
      }

      await this.prisma.agregadoAsistenciaMensual.upsert({
        where: { estudianteId_anioMes: { estudianteId: grupo.estudianteId, anioMes: grupo.anioMes } },
        create: {
          centroId: grupo.centroId,
          estudianteId: grupo.estudianteId,
          anioMes: grupo.anioMes,
          porcentajeAsistenciaMensual,
          rachaMaximaAusenciasConsecutivas: rachaMaxima,
        },
        update: {
          porcentajeAsistenciaMensual,
          rachaMaximaAusenciasConsecutivas: rachaMaxima,
          calculadoEn: new Date(),
        },
      });
    }
  }
}
