import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AsistenciaRegistro } from '../../common/interfaces/entities';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudent(estudianteId: string): Promise<AsistenciaRegistro[]> {
    return this.prisma.asistenciaRegistro.findMany({
      where: { estudianteId },
      orderBy: { fecha: 'desc' },
    });
  }

  create(data: Omit<AsistenciaRegistro, 'id' | 'createdAt'>): Promise<AsistenciaRegistro> {
    return this.prisma.asistenciaRegistro.create({ data: data as never });
  }
}
