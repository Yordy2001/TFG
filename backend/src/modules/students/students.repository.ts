import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { Estudiante } from '../../common/interfaces/entities';

@Injectable()
export class StudentsRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(centroId: string, cursoId?: string): Estudiante[] {
    return this.store.estudiantes.filter(
      (e) => e.centroId === centroId && (!cursoId || e.cursoId === cursoId),
    );
  }

  findById(id: string, centroId: string): Estudiante | undefined {
    return this.store.estudiantes.find((e) => e.id === id && e.centroId === centroId);
  }

  findByMatricula(matricula: string): Estudiante | undefined {
    return this.store.estudiantes.find((e) => e.matricula === matricula);
  }

  create(data: Omit<Estudiante, 'id' | 'createdAt' | 'updatedAt'>): Estudiante {
    const now = new Date();
    const estudiante: Estudiante = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.estudiantes.push(estudiante);
    return estudiante;
  }

  update(id: string, centroId: string, data: Partial<Estudiante>): Estudiante | undefined {
    const estudiante = this.findById(id, centroId);
    if (!estudiante) return undefined;
    Object.assign(estudiante, data, { updatedAt: new Date() });
    return estudiante;
  }

  hasHistory(estudianteId: string): boolean {
    return (
      this.store.registrosEvaluacion.some((r) => r.estudianteId === estudianteId) ||
      this.store.asistencias.some((a) => a.estudianteId === estudianteId) ||
      this.store.seguimientos.some((s) => s.estudianteId === estudianteId)
    );
  }

  deactivate(id: string, centroId: string): Estudiante | undefined {
    return this.update(id, centroId, { activo: false });
  }
}
