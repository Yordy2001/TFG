import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoAsistencia, PeriodoEvaluativo } from '../enums';

export interface CompetenciaResultado {
  competencia: string;
  promedio: number;
}

export interface AsignaturaResultado {
  asignaturaId: string;
  asignaturaNombre: string;
  promedioPeriodo: number;
  competencias: CompetenciaResultado[];
}

/**
 * Computes derived academic indicators (weighted averages, competency
 * results, attendance %) from raw activity/grade/attendance records.
 * Never touches risk — that belongs to RiskEngine.
 */
@Injectable()
export class AcademicEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async promedioPonderadoAsignacion(
    asignacionDocenteId: string,
    estudianteId: string,
    periodo: PeriodoEvaluativo,
  ): Promise<number> {
    const actividades = await this.prisma.actividadEvaluacion.findMany({
      where: { asignacionDocenteId, periodoEvaluativo: periodo as never },
    });
    if (actividades.length === 0) return 0;

    const registros = await this.prisma.registroEvaluacion.findMany({
      where: { estudianteId, actividadId: { in: actividades.map((a) => a.id) } },
    });
    const registroPorActividad = new Map(registros.map((r) => [r.actividadId, r]));

    let acumulado = 0;
    let pesoConNota = 0;
    for (const actividad of actividades) {
      const registro = registroPorActividad.get(actividad.id);
      if (registro) {
        acumulado += (registro.nota * actividad.porcentaje) / 100;
        pesoConNota += actividad.porcentaje;
      }
    }
    if (pesoConNota === 0) return 0;
    return Math.round((acumulado / pesoConNota) * 100 * 100) / 100;
  }

  async resultadosPorAsignatura(estudianteId: string, cursoId: string): Promise<AsignaturaResultado[]> {
    const asignaciones = await this.prisma.asignacionDocente.findMany({
      where: { cursoId },
      include: { asignatura: true },
    });
    if (asignaciones.length === 0) return [];

    const actividades = await this.prisma.actividadEvaluacion.findMany({
      where: { asignacionDocenteId: { in: asignaciones.map((a) => a.id) } },
    });
    const registros = await this.prisma.registroEvaluacion.findMany({
      where: { estudianteId, actividadId: { in: actividades.map((a) => a.id) } },
    });
    const registroPorActividad = new Map(registros.map((r) => [r.actividadId, r]));

    const resultados: AsignaturaResultado[] = [];
    for (const asignacion of asignaciones) {
      const actividadesAsignacion = actividades.filter((a) => a.asignacionDocenteId === asignacion.id);
      const competenciaMap = new Map<string, { acumulado: number; peso: number }>();
      let acumuladoTotal = 0;
      let pesoTotal = 0;

      for (const actividad of actividadesAsignacion) {
        const registro = registroPorActividad.get(actividad.id);
        if (!registro) continue;
        acumuladoTotal += (registro.nota * actividad.porcentaje) / 100;
        pesoTotal += actividad.porcentaje;

        const entry = competenciaMap.get(actividad.competencia) ?? { acumulado: 0, peso: 0 };
        entry.acumulado += (registro.nota * actividad.porcentaje) / 100;
        entry.peso += actividad.porcentaje;
        competenciaMap.set(actividad.competencia, entry);
      }

      const promedioPeriodo = pesoTotal > 0 ? Math.round((acumuladoTotal / pesoTotal) * 100 * 100) / 100 : 0;
      const competencias: CompetenciaResultado[] = Array.from(competenciaMap.entries()).map(
        ([competencia, { acumulado, peso }]) => ({
          competencia,
          promedio: peso > 0 ? Math.round((acumulado / peso) * 100 * 100) / 100 : 0,
        }),
      );

      resultados.push({
        asignaturaId: asignacion.asignatura.id,
        asignaturaNombre: asignacion.asignatura.nombre,
        promedioPeriodo,
        competencias,
      });
    }

    return resultados;
  }

  async promedioGeneral(estudianteId: string, cursoId: string): Promise<number> {
    const resultados = await this.resultadosPorAsignatura(estudianteId, cursoId);
    if (resultados.length === 0) return 0;
    const suma = resultados.reduce((acc, r) => acc + r.promedioPeriodo, 0);
    return Math.round((suma / resultados.length) * 100) / 100;
  }

  async asignaturasEnBajoRendimiento(estudianteId: string, cursoId: string, umbral = 70): Promise<number> {
    const resultados = await this.resultadosPorAsignatura(estudianteId, cursoId);
    return resultados.filter((r) => r.promedioPeriodo < umbral).length;
  }

  async porcentajeAsistencia(
    estudianteId: string,
  ): Promise<{ asistencia: number; ausencias: number; tardanzas: number }> {
    const registros = await this.prisma.asistenciaRegistro.findMany({ where: { estudianteId } });
    if (registros.length === 0) return { asistencia: 100, ausencias: 0, tardanzas: 0 };

    const presentes = registros.filter((r) => r.estado === EstadoAsistencia.PRESENTE).length;
    const ausentes = registros.filter((r) => r.estado === EstadoAsistencia.AUSENTE).length;
    const tardanzas = registros.filter((r) => r.estado === EstadoAsistencia.TARDANZA).length;

    return {
      asistencia: Math.round((presentes / registros.length) * 100 * 100) / 100,
      ausencias: Math.round((ausentes / registros.length) * 100 * 100) / 100,
      tardanzas: Math.round((tardanzas / registros.length) * 100 * 100) / 100,
    };
  }
}
