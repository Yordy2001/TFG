import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  findAll(centroId: string, cursoId?: string) {
    return this.studentsRepository.findAll(centroId, cursoId);
  }

  findOne(id: string, centroId: string) {
    const estudiante = this.studentsRepository.findById(id, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  create(dto: CreateStudentDto, centroId: string) {
    if (this.studentsRepository.findByMatricula(dto.matricula)) {
      throw new BadRequestException('Matrícula already exists');
    }
    return this.studentsRepository.create({ ...dto, centroId, activo: true, incidentesDisciplinarios: 0 });
  }

  update(id: string, centroId: string, dto: UpdateStudentDto) {
    const estudiante = this.studentsRepository.update(id, centroId, dto);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }

  deactivate(id: string, centroId: string) {
    const estudiante = this.studentsRepository.deactivate(id, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');
    return estudiante;
  }
}
