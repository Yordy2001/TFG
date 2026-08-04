import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { RegisterAttendanceDto } from './dto/attendance.dto';
import { AcademicEngineService } from '../../common/engines/academic-engine.service';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { MockDataStore } from '../../common/mock-data/mock-data.store';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly academicEngine: AcademicEngineService,
    private readonly riskEngine: RiskEngineService,
    private readonly store: MockDataStore,
  ) {}

  register(dto: RegisterAttendanceDto, centroId: string) {
    const estudiante = this.store.estudiantes.find((e) => e.id === dto.estudianteId && e.centroId === centroId);
    if (!estudiante) throw new NotFoundException('Student not found');

    const registro = this.attendanceRepository.create({ ...dto, centroId });
    this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
    return registro;
  }

  summary(estudianteId: string) {
    return {
      historial: this.attendanceRepository.findByStudent(estudianteId),
      ...this.academicEngine.porcentajeAsistencia(estudianteId),
    };
  }
}
