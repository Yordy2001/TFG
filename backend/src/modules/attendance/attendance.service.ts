import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { RegisterAttendanceDto } from './dto/attendance.dto';
import { AcademicEngineService } from '../../common/engines/academic-engine.service';
import { RiskEngineService } from '../../common/engines/risk-engine.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly academicEngine: AcademicEngineService,
    private readonly riskEngine: RiskEngineService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterAttendanceDto, centroId: string) {
    const estudiante = await this.prisma.estudiante.findFirst({ where: { id: dto.estudianteId, centroId } });
    if (!estudiante) throw new NotFoundException('Student not found');

    const registro = await this.attendanceRepository.create({ ...dto, centroId });
    await this.riskEngine.recalcularYRegistrar(estudiante.id, estudiante.cursoId, centroId);
    return registro;
  }

  async summary(estudianteId: string) {
    const [historial, indicadores] = await Promise.all([
      this.attendanceRepository.findByStudent(estudianteId),
      this.academicEngine.porcentajeAsistencia(estudianteId),
    ]);
    return { historial, ...indicadores };
  }
}
