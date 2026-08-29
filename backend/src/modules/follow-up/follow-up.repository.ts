import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SeguimientoOrientador } from '../../common/interfaces/entities';

@Injectable()
export class FollowUpRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudent(estudianteId: string, centroId: string): Promise<SeguimientoOrientador[]> {
    return this.prisma.seguimientoOrientador.findMany({
      where: { estudianteId, centroId },
      orderBy: { fecha: 'desc' },
    });
  }

  findRecent(centroId: string, limit: number): Promise<SeguimientoOrientador[]> {
    return this.prisma.seguimientoOrientador.findMany({
      where: { centroId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  create(data: Omit<SeguimientoOrientador, 'id' | 'createdAt' | 'updatedAt'>): Promise<SeguimientoOrientador> {
    return this.prisma.seguimientoOrientador.create({ data: data as never });
  }

  async update(
    id: string,
    centroId: string,
    data: Partial<SeguimientoOrientador>,
  ): Promise<SeguimientoOrientador | undefined> {
    const result = await this.prisma.seguimientoOrientador.updateMany({ where: { id, centroId }, data: data as never });
    if (result.count === 0) return undefined;
    return (await this.prisma.seguimientoOrientador.findFirst({ where: { id, centroId } })) ?? undefined;
  }
}
