import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { AsistenciaRegistro } from '../../common/interfaces/entities';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly store: MockDataStore) {}

  findByStudent(estudianteId: string): AsistenciaRegistro[] {
    return this.store.asistencias
      .filter((a) => a.estudianteId === estudianteId)
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }

  create(data: Omit<AsistenciaRegistro, 'id' | 'createdAt'>): AsistenciaRegistro {
    const registro: AsistenciaRegistro = { ...data, id: uuid(), createdAt: new Date() };
    this.store.asistencias.push(registro);
    return registro;
  }
}
