import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EvaluationsRepository } from './evaluations.repository';
import { CreateActivityDto, RegisterGradeDto } from './dto/evaluation.dto';
import { AcademicEngineService } from '../../common/engines/academic-engine.service';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { MockDataStore } from '../../common/mock-data/mock-data.store';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly evaluationsRepository: EvaluationsRepository,
    private readonly academicEngine: AcademicEngineService,
    private readonly riskEngine: RiskEngineService,
    private readonly store: MockDataStore,
  ) {}

  activitiesByAssignment(asignacionDocenteId: string) {
    return this.evaluationsRepository.findActivitiesByAssignment(asignacionDocenteId);
  }

  createActivity(dto: CreateActivityDto, centroId: string) {
    const acumulado = this.evaluationsRepository.pesoAcumulado(dto.asignacionDocenteId, dto.periodoEvaluativo);
    if (acumulado + dto.porcentaje > 100) {
      throw new BadRequestException(
        `Activity weight exceeds 100% for this period (accumulated: ${acumulado}%)`,
      );
    }
    return this.evaluationsRepository.createActivity({ ...dto, centroId });
  }

  registerGrade(dto: RegisterGradeDto, centroId: string) {
    const actividad = this.evaluationsRepository.findActivityById(dto.actividadId, centroId);
    if (!actividad) throw new NotFoundException('Activity not found');

    const estudiante = this.store.estudiantes.find((e) => e.id === dto.estudianteId && e.centroId === centroId);
    if (!estudiante) throw new NotFoundException('Student not found');

    const registro = this.evaluationsRepository.upsertGrade({ ...dto, centroId });
    this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
    return registro;
  }

  resultadosEstudiante(estudianteId: string, cursoId: string) {
    return {
      asignaturas: this.academicEngine.resultadosPorAsignatura(estudianteId, cursoId),
      promedioGeneral: this.academicEngine.promedioGeneral(estudianteId, cursoId),
    };
  }
}
