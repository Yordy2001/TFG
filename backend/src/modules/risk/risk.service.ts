import { Injectable, NotFoundException } from '@nestjs/common';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { MockDataStore } from '../../common/mock-data/mock-data.store';
import { RiskAdjustmentDto } from './dto/risk-adjustment.dto';

@Injectable()
export class RiskService {
  constructor(
    private readonly riskEngine: RiskEngineService,
    private readonly store: MockDataStore,
  ) {}

  private getStudentOrThrow(estudianteId: string, centroId: string) {
    const estudiante = this.store.estudiantes.find((e) => e.id === estudianteId && e.centroId === centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  current(estudianteId: string, centroId: string) {
    const estudiante = this.getStudentOrThrow(estudianteId, centroId);
    const riesgo = this.store.riesgos.find((r) => r.estudianteId === estudiante.id);
    if (riesgo) return riesgo;
    return this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
  }

  history(estudianteId: string, centroId: string) {
    this.getStudentOrThrow(estudianteId, centroId);
    return this.riskEngine.historial(estudianteId);
  }

  listByCentro(centroId: string) {
    return this.store.riesgos.filter((r) => r.centroId === centroId);
  }

  applyAdjustment(dto: RiskAdjustmentDto, centroId: string, usuarioId: string) {
    const estudiante = this.getStudentOrThrow(dto.estudianteId, centroId);
    return this.riskEngine.aplicarAjusteProfesional(estudiante.id, estudiante.cursoId, centroId, dto.ajuste, usuarioId);
  }
}
