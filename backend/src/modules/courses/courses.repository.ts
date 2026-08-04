import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { Curso } from '../../common/interfaces/entities';

@Injectable()
export class CoursesRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(centroId: string): Curso[] {
    return this.store.cursos.filter((c) => c.centroId === centroId);
  }

  findById(id: string, centroId: string): Curso | undefined {
    return this.store.cursos.find((c) => c.id === id && c.centroId === centroId);
  }

  create(data: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>): Curso {
    const now = new Date();
    const curso: Curso = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.cursos.push(curso);
    return curso;
  }

  update(id: string, centroId: string, data: Partial<Curso>): Curso | undefined {
    const curso = this.findById(id, centroId);
    if (!curso) return undefined;
    Object.assign(curso, data, { updatedAt: new Date() });
    return curso;
  }

  hasStudents(cursoId: string): boolean {
    return this.store.estudiantes.some((e) => e.cursoId === cursoId && e.activo);
  }

  remove(id: string, centroId: string): boolean {
    const idx = this.store.cursos.findIndex((c) => c.id === id && c.centroId === centroId);
    if (idx === -1) return false;
    this.store.cursos.splice(idx, 1);
    return true;
  }
}
