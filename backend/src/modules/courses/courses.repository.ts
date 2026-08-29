import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Curso } from '../../common/interfaces/entities';

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(centroId: string): Promise<Curso[]> {
    return this.prisma.curso.findMany({ where: { centroId } });
  }

  findById(id: string, centroId: string): Promise<Curso | null> {
    return this.prisma.curso.findFirst({ where: { id, centroId } });
  }

  create(data: Omit<Curso, 'id' | 'createdAt' | 'updatedAt'>): Promise<Curso> {
    return this.prisma.curso.create({ data });
  }

  async update(id: string, centroId: string, data: Partial<Curso>): Promise<Curso | undefined> {
    const result = await this.prisma.curso.updateMany({ where: { id, centroId }, data });
    if (result.count === 0) return undefined;
    return (await this.findById(id, centroId)) ?? undefined;
  }

  async hasStudents(cursoId: string): Promise<boolean> {
    const count = await this.prisma.estudiante.count({ where: { cursoId, activo: true } });
    return count > 0;
  }

  async remove(id: string, centroId: string): Promise<boolean> {
    const result = await this.prisma.curso.deleteMany({ where: { id, centroId } });
    return result.count > 0;
  }
}
