import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ActividadEvaluacion, RegistroEvaluacion } from '../../common/interfaces/entities';

@Injectable()
export class EvaluationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActivitiesByAssignment(asignacionDocenteId: string): Promise<ActividadEvaluacion[]> {
    return this.prisma.actividadEvaluacion.findMany({ where: { asignacionDocenteId } });
  }

  findActivityById(id: string, centroId: string): Promise<ActividadEvaluacion | null> {
    return this.prisma.actividadEvaluacion.findFirst({ where: { id, centroId } });
  }

  async pesoAcumulado(asignacionDocenteId: string, periodoEvaluativo: string): Promise<number> {
    const result = await this.prisma.actividadEvaluacion.aggregate({
      where: { asignacionDocenteId, periodoEvaluativo: periodoEvaluativo as never },
      _sum: { porcentaje: true },
    });
    return result._sum.porcentaje ?? 0;
  }

  createActivity(data: Omit<ActividadEvaluacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActividadEvaluacion> {
    return this.prisma.actividadEvaluacion.create({ data: data as never });
  }

  findGrade(actividadId: string, estudianteId: string): Promise<RegistroEvaluacion | null> {
    return this.prisma.registroEvaluacion.findUnique({
      where: { actividadId_estudianteId: { actividadId, estudianteId } },
    });
  }

  upsertGrade(data: Omit<RegistroEvaluacion, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegistroEvaluacion> {
    return this.prisma.registroEvaluacion.upsert({
      where: { actividadId_estudianteId: { actividadId: data.actividadId, estudianteId: data.estudianteId } },
      create: data,
      update: { nota: data.nota },
    });
  }

  findGradesByActivity(actividadId: string): Promise<RegistroEvaluacion[]> {
    return this.prisma.registroEvaluacion.findMany({ where: { actividadId } });
  }
}
