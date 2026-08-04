import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { SeguimientoOrientador } from '../../common/interfaces/entities';

@Injectable()
export class FollowUpRepository {
  constructor(private readonly store: MockDataStore) {}

  findByStudent(estudianteId: string, centroId: string): SeguimientoOrientador[] {
    return this.store.seguimientos
      .filter((s) => s.estudianteId === estudianteId && s.centroId === centroId)
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }

  findRecent(centroId: string, limit: number): SeguimientoOrientador[] {
    return this.store.seguimientos
      .filter((s) => s.centroId === centroId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  create(data: Omit<SeguimientoOrientador, 'id' | 'createdAt' | 'updatedAt'>): SeguimientoOrientador {
    const now = new Date();
    const seguimiento: SeguimientoOrientador = { ...data, id: uuid(), createdAt: now, updatedAt: now };
    this.store.seguimientos.push(seguimiento);
    return seguimiento;
  }

  update(id: string, centroId: string, data: Partial<SeguimientoOrientador>): SeguimientoOrientador | undefined {
    const seguimiento = this.store.seguimientos.find((s) => s.id === id && s.centroId === centroId);
    if (!seguimiento) return undefined;
    Object.assign(seguimiento, data, { updatedAt: new Date() });
    return seguimiento;
  }
}
