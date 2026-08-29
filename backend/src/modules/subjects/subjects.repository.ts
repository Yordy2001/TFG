import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Asignatura, AsignacionDocente } from '../../common/interfaces/entities';

@Injectable()
export class SubjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(centroId: string): Promise<Asignatura[]> {
    return this.prisma.asignatura.findMany({ where: { centroId } });
  }

  findById(id: string, centroId: string): Promise<Asignatura | null> {
    return this.prisma.asignatura.findFirst({ where: { id, centroId } });
  }

  create(data: Omit<Asignatura, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asignatura> {
    return this.prisma.asignatura.create({ data });
  }

  async hasActivities(asignaturaId: string): Promise<boolean> {
    const count = await this.prisma.actividadEvaluacion.count({
      where: { asignacion: { asignaturaId } },
    });
    return count > 0;
  }

  findAssignments(centroId: string, docenteId?: string): Promise<AsignacionDocente[]> {
    return this.prisma.asignacionDocente.findMany({
      where: { centroId, ...(docenteId ? { docenteId } : {}) },
    });
  }

  findAssignmentById(id: string, centroId: string): Promise<AsignacionDocente | null> {
    return this.prisma.asignacionDocente.findFirst({ where: { id, centroId } });
  }

  createAssignment(data: Omit<AsignacionDocente, 'id'>): Promise<AsignacionDocente> {
    return this.prisma.asignacionDocente.create({ data });
  }
}
