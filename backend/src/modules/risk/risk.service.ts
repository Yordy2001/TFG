import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RiskAdjustmentDto } from './dto/risk-adjustment.dto';

@Injectable()
export class RiskService {
  constructor(
    private readonly riskEngine: RiskEngineService,
    private readonly prisma: PrismaService,
  ) {}

  private async getStudentOrThrow(estudianteId: string, centroId: string) {
    const estudiante = await this.prisma.estudiante.findFirst({ where: { id: estudianteId, centroId } });
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  async current(estudianteId: string, centroId: string) {
    const estudiante = await this.getStudentOrThrow(estudianteId, centroId);
    const riesgo = await this.prisma.riesgo.findUnique({ where: { estudianteId: estudiante.id } });
    if (riesgo) return riesgo;
    return this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
  }

  async history(estudianteId: string, centroId: string) {
    await this.getStudentOrThrow(estudianteId, centroId);
    return this.riskEngine.historial(estudianteId);
  }

  listByCentro(centroId: string) {
    return this.prisma.riesgo.findMany({ where: { centroId } });
  }

  async applyAdjustment(dto: RiskAdjustmentDto, centroId: string, usuarioId: string) {
    const estudiante = await this.getStudentOrThrow(dto.estudianteId, centroId);
    return this.riskEngine.aplicarAjusteProfesional(estudiante.id, estudiante.cursoId, centroId, dto.ajuste, usuarioId);
  }
}
