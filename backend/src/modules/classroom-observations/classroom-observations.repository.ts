import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ObservacionAula } from '../../common/interfaces/entities';

@Injectable()
export class ClassroomObservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudent(estudianteId: string, centroId: string): Promise<ObservacionAula[]> {
    return this.prisma.observacionAula.findMany({
      where: { estudianteId, centroId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string, centroId: string): Promise<ObservacionAula | null> {
    return this.prisma.observacionAula.findFirst({ where: { id, centroId } });
  }

  create(data: Omit<ObservacionAula, 'id' | 'createdAt' | 'updatedAt'>): Promise<ObservacionAula> {
    return this.prisma.observacionAula.create({ data: data as never });
  }

  async update(id: string, centroId: string, data: Partial<ObservacionAula>): Promise<ObservacionAula | undefined> {
    const result = await this.prisma.observacionAula.updateMany({ where: { id, centroId }, data: data as never });
    if (result.count === 0) return undefined;
    return (await this.findById(id, centroId)) ?? undefined;
  }

  async remove(id: string, centroId: string): Promise<boolean> {
    const result = await this.prisma.observacionAula.deleteMany({ where: { id, centroId } });
    return result.count > 0;
  }
}
