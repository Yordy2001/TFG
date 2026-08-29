import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Estudiante } from '../../common/interfaces/entities';

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(centroId: string, cursoId?: string): Promise<Estudiante[]> {
    return this.prisma.estudiante.findMany({ where: { centroId, ...(cursoId ? { cursoId } : {}) } });
  }

  findById(id: string, centroId: string): Promise<Estudiante | null> {
    return this.prisma.estudiante.findFirst({ where: { id, centroId } });
  }

  findByMatricula(matricula: string): Promise<Estudiante | null> {
    return this.prisma.estudiante.findUnique({ where: { matricula } });
  }

  async findExistingMatriculas(matriculas: string[]): Promise<Set<string>> {
    if (matriculas.length === 0) return new Set();
    const found = await this.prisma.estudiante.findMany({
      where: { matricula: { in: matriculas } },
      select: { matricula: true },
    });
    return new Set(found.map((f) => f.matricula));
  }

  create(data: Omit<Estudiante, 'id' | 'createdAt' | 'updatedAt'>): Promise<Estudiante> {
    return this.prisma.estudiante.create({ data: data as never });
  }

  async update(id: string, centroId: string, data: Partial<Estudiante>): Promise<Estudiante | undefined> {
    const result = await this.prisma.estudiante.updateMany({ where: { id, centroId }, data: data as never });
    if (result.count === 0) return undefined;
    return (await this.findById(id, centroId)) ?? undefined;
  }

  async hasHistory(estudianteId: string): Promise<boolean> {
    const [evaluaciones, asistencias, seguimientos] = await Promise.all([
      this.prisma.registroEvaluacion.count({ where: { estudianteId } }),
      this.prisma.asistenciaRegistro.count({ where: { estudianteId } }),
      this.prisma.seguimientoOrientador.count({ where: { estudianteId } }),
    ]);
    return evaluaciones > 0 || asistencias > 0 || seguimientos > 0;
  }

  deactivate(id: string, centroId: string): Promise<Estudiante | undefined> {
    return this.update(id, centroId, { activo: false });
  }
}
