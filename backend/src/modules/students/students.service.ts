import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { IdentityMappingService } from '../identity-mapping/identity-mapping.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly identityMappingService: IdentityMappingService,
  ) {}

  findAll(centroId: string, cursoId?: string) {
    return this.studentsRepository.findAll(centroId, cursoId);
  }

  async findOne(id: string, centroId: string) {
    const estudiante = await this.studentsRepository.findById(id, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  async create(dto: CreateStudentDto, centroId: string) {
    if (await this.studentsRepository.findByMatricula(dto.matricula)) {
      throw new BadRequestException('Matrícula already exists');
    }
    const estudiante = await this.studentsRepository.create({
      ...dto,
      centroId,
      activo: true,
      incidentesDisciplinarios: 0,
    });
    try {
      await this.identityMappingService.ensureHash(estudiante.id, centroId);
    } catch (error) {
      this.logger.warn(`No se pudo generar el hash de identidad para ${estudiante.id}: ${error}`);
    }
    return estudiante;
  }

  async update(id: string, centroId: string, dto: UpdateStudentDto) {
    const estudiante = await this.studentsRepository.update(id, centroId, dto);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  async deactivate(id: string, centroId: string) {
    const estudiante = await this.studentsRepository.deactivate(id, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }
}
