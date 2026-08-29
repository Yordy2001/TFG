import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EvaluationsRepository } from './evaluations.repository';
import { CreateActivityDto, RegisterGradeDto } from './dto/evaluation.dto';
import { AcademicEngineService } from '../../common/engines/academic-engine.service';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly evaluationsRepository: EvaluationsRepository,
    private readonly academicEngine: AcademicEngineService,
    private readonly riskEngine: RiskEngineService,
    private readonly prisma: PrismaService,
  ) {}

  activitiesByAssignment(asignacionDocenteId: string) {
    return this.evaluationsRepository.findActivitiesByAssignment(asignacionDocenteId);
  }

  async createActivity(dto: CreateActivityDto, centroId: string) {
    const acumulado = await this.evaluationsRepository.pesoAcumulado(dto.asignacionDocenteId, dto.periodoEvaluativo);
    if (acumulado + dto.porcentaje > 100) {
      throw new BadRequestException(
        `Activity weight exceeds 100% for this period (accumulated: ${acumulado}%)`,
      );
    }
    return this.evaluationsRepository.createActivity({ ...dto, centroId });
  }

  async registerGrade(dto: RegisterGradeDto, centroId: string) {
    const actividad = await this.evaluationsRepository.findActivityById(dto.actividadId, centroId);
    if (!actividad) throw new NotFoundException('Activity not found');

    const estudiante = await this.prisma.estudiante.findFirst({ where: { id: dto.estudianteId, centroId } });
    if (!estudiante) throw new NotFoundException('Student not found');

    const registro = await this.evaluationsRepository.upsertGrade({ ...dto, centroId });
    await this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
    return registro;
  }

  async resultadosEstudiante(estudianteId: string, cursoId: string) {
    const [asignaturas, promedioGeneral] = await Promise.all([
      this.academicEngine.resultadosPorAsignatura(estudianteId, cursoId),
      this.academicEngine.promedioGeneral(estudianteId, cursoId),
    ]);
    return { asignaturas, promedioGeneral };
  }
}
