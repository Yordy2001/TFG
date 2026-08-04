import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { Asignatura, AsignacionDocente } from '../../common/interfaces/entities';

@Injectable()
export class SubjectsRepository {
  constructor(private readonly store: MockDataStore) {}

  findAll(centroId: string): Asignatura[] {
    return this.store.asignaturas.filter((a) => a.centroId === centroId);
  }

  findById(id: string, centroId: string): Asignatura | undefined {
    return this.store.asignaturas.find((a) => a.id === id && a.centroId === centroId);
  }

  create(data: Omit<Asignatura, 'id' | 'createdAt' | 'updatedAt'>): Asignatura {
    const now = new Date();
    const asignatura: Asignatura = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.asignaturas.push(asignatura);
    return asignatura;
  }

  hasActivities(asignaturaId: string): boolean {
    return this.store.asignacionesDocentes
      .filter((a) => a.asignaturaId === asignaturaId)
      .some((asignacion) => this.store.actividades.some((act) => act.asignacionDocenteId === asignacion.id));
  }

  findAssignments(centroId: string, docenteId?: string): AsignacionDocente[] {
    return this.store.asignacionesDocentes.filter(
      (a) => a.centroId === centroId && (!docenteId || a.docenteId === docenteId),
    );
  }

  findAssignmentById(id: string, centroId: string): AsignacionDocente | undefined {
    return this.store.asignacionesDocentes.find((a) => a.id === id && a.centroId === centroId);
  }

  createAssignment(data: Omit<AsignacionDocente, 'id'>): AsignacionDocente {
    const asignacion: AsignacionDocente = { ...data, id: uuid() };
    this.store.asignacionesDocentes.push(asignacion);
    return asignacion;
  }
}
