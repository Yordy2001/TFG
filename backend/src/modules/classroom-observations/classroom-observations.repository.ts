import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { ObservacionAula } from '../../common/interfaces/entities';

@Injectable()
export class ClassroomObservationsRepository {
  constructor(private readonly store: MockDataStore) {}

  findByStudent(estudianteId: string, centroId: string): ObservacionAula[] {
    return this.store.observacionesAula
      .filter((o) => o.estudianteId === estudianteId && o.centroId === centroId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  findById(id: string, centroId: string): ObservacionAula | undefined {
    return this.store.observacionesAula.find((o) => o.id === id && o.centroId === centroId);
  }

  create(data: Omit<ObservacionAula, 'id' | 'createdAt' | 'updatedAt'>): ObservacionAula {
    const now = new Date();
    const observacion: ObservacionAula = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.observacionesAula.push(observacion);
    return observacion;
  }

  update(id: string, centroId: string, data: Partial<ObservacionAula>): ObservacionAula | undefined {
    const observacion = this.findById(id, centroId);
    if (!observacion) return undefined;
    Object.assign(observacion, data, { updatedAt: new Date() });
    return observacion;
  }

  remove(id: string, centroId: string): boolean {
    const index = this.store.observacionesAula.findIndex((o) => o.id === id && o.centroId === centroId);
    if (index === -1) return false;
    this.store.observacionesAula.splice(index, 1);
    return true;
  }
}
