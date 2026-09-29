import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ReporteCalidadDato } from '../../common/interfaces/entities';

@Injectable()
export class DataQualityRepository {
  constructor(private readonly prisma: PrismaService) {}

  findRecent(centroId: string): Promise<ReporteCalidadDato[]> {
    return this.prisma.reporteCalidadDato.findMany({
      where: { centroId },
      orderBy: { generadoEn: 'desc' },
      take: 50,
    });
  }
}
