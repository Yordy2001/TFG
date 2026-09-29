import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DesenlaceEstudiante } from '../../common/interfaces/entities';

@Injectable()
export class OutcomesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudent(estudianteId: string, centroId: string): Promise<DesenlaceEstudiante[]> {
    return this.prisma.desenlaceEstudiante.findMany({
      where: { estudianteId, centroId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(
    data: Omit<DesenlaceEstudiante, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DesenlaceEstudiante> {
    return this.prisma.desenlaceEstudiante.create({ data: data as never });
  }

  async update(
    id: string,
    centroId: string,
    data: Partial<DesenlaceEstudiante>,
  ): Promise<DesenlaceEstudiante | undefined> {
    const result = await this.prisma.desenlaceEstudiante.updateMany({ where: { id, centroId }, data: data as never });
    if (result.count === 0) return undefined;
    return (await this.prisma.desenlaceEstudiante.findFirst({ where: { id, centroId } })) ?? undefined;
  }
}
