import { Injectable } from '@nestjs/common';
import { MockDataStore } from '../mock-data/mock-data.store';
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
  constructor(private readonly store: MockDataStore) {}

  promedioPonderadoAsignacion(asignacionDocenteId: string, estudianteId: string, periodo: PeriodoEvaluativo): number {
    const actividades = this.store.actividades.filter(
      (a) => a.asignacionDocenteId === asignacionDocenteId && a.periodoEvaluativo === periodo,
    );
    if (actividades.length === 0) return 0;

    let acumulado = 0;
    let pesoConNota = 0;
    for (const actividad of actividades) {
      const registro = this.store.registrosEvaluacion.find(
        (r) => r.actividadId === actividad.id && r.estudianteId === estudianteId,
      );
      if (registro) {
        acumulado += (registro.nota * actividad.porcentaje) / 100;
        pesoConNota += actividad.porcentaje;
      }
    }
    if (pesoConNota === 0) return 0;
    // Normalize in case not all activities have been graded yet.
    return Math.round((acumulado / pesoConNota) * 100 * 100) / 100;
  }

  resultadosPorAsignatura(estudianteId: string, cursoId: string): AsignaturaResultado[] {
    const asignaciones = this.store.asignacionesDocentes.filter((a) => a.cursoId === cursoId);
    const resultados: AsignaturaResultado[] = [];

    for (const asignacion of asignaciones) {
      const asignatura = this.store.asignaturas.find((a) => a.id === asignacion.asignaturaId);
      if (!asignatura) continue;

      const actividades = this.store.actividades.filter((a) => a.asignacionDocenteId === asignacion.id);
      const competenciaMap = new Map<string, { acumulado: number; peso: number }>();
      let acumuladoTotal = 0;
      let pesoTotal = 0;

      for (const actividad of actividades) {
        const registro = this.store.registrosEvaluacion.find(
          (r) => r.actividadId === actividad.id && r.estudianteId === estudianteId,
        );
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
        asignaturaId: asignatura.id,
        asignaturaNombre: asignatura.nombre,
        promedioPeriodo,
        competencias,
      });
    }

    return resultados;
  }

  promedioGeneral(estudianteId: string, cursoId: string): number {
    const resultados = this.resultadosPorAsignatura(estudianteId, cursoId);
    if (resultados.length === 0) return 0;
    const suma = resultados.reduce((acc, r) => acc + r.promedioPeriodo, 0);
    return Math.round((suma / resultados.length) * 100) / 100;
  }

  asignaturasEnBajoRendimiento(estudianteId: string, cursoId: string, umbral = 70): number {
    return this.resultadosPorAsignatura(estudianteId, cursoId).filter((r) => r.promedioPeriodo < umbral).length;
  }

  porcentajeAsistencia(estudianteId: string): { asistencia: number; ausencias: number; tardanzas: number } {
    const registros = this.store.asistencias.filter((a) => a.estudianteId === estudianteId);
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
