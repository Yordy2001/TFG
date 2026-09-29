import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IdentidadEstudianteMapping } from '../../common/interfaces/entities';

@Injectable()
export class IdentityMappingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudent(estudianteId: string): Promise<IdentidadEstudianteMapping | null> {
    return this.prisma.identidadEstudianteMapping.findUnique({ where: { estudianteId } });
  }

  upsert(estudianteId: string, centroId: string, estudianteHash: string): Promise<IdentidadEstudianteMapping> {
    return this.prisma.identidadEstudianteMapping.upsert({
      where: { estudianteId },
      create: { estudianteId, centroId, estudianteHash },
      update: { estudianteHash },
    });
  }
}
