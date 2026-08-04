import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { ActividadEvaluacion, RegistroEvaluacion } from '../../common/interfaces/entities';

@Injectable()
export class EvaluationsRepository {
  constructor(private readonly store: MockDataStore) {}

  findActivitiesByAssignment(asignacionDocenteId: string): ActividadEvaluacion[] {
    return this.store.actividades.filter((a) => a.asignacionDocenteId === asignacionDocenteId);
  }

  findActivityById(id: string, centroId: string): ActividadEvaluacion | undefined {
    return this.store.actividades.find((a) => a.id === id && a.centroId === centroId);
  }

  pesoAcumulado(asignacionDocenteId: string, periodoEvaluativo: string): number {
    return this.store.actividades
      .filter((a) => a.asignacionDocenteId === asignacionDocenteId && a.periodoEvaluativo === periodoEvaluativo)
      .reduce((acc, a) => acc + a.porcentaje, 0);
  }

  createActivity(data: Omit<ActividadEvaluacion, 'id' | 'createdAt' | 'updatedAt'>): ActividadEvaluacion {
    const now = new Date();
    const actividad: ActividadEvaluacion = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.actividades.push(actividad);
    return actividad;
  }

  findGrade(actividadId: string, estudianteId: string): RegistroEvaluacion | undefined {
    return this.store.registrosEvaluacion.find(
      (r) => r.actividadId === actividadId && r.estudianteId === estudianteId,
    );
  }

  upsertGrade(data: Omit<RegistroEvaluacion, 'id' | 'createdAt' | 'updatedAt'>): RegistroEvaluacion {
    const now = new Date();
    const existing = this.findGrade(data.actividadId, data.estudianteId);
    if (existing) {
      existing.nota = data.nota;
      existing.updatedAt = now;
      return existing;
    }
    const registro: RegistroEvaluacion = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.registrosEvaluacion.push(registro);
    return registro;
  }

  findGradesByActivity(actividadId: string): RegistroEvaluacion[] {
    return this.store.registrosEvaluacion.filter((r) => r.actividadId === actividadId);
  }
}
