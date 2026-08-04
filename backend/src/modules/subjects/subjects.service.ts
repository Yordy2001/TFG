import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectsRepository } from './subjects.repository';
import { CreateAssignmentDto, CreateSubjectDto } from './dto/subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly subjectsRepository: SubjectsRepository) {}

  findAll(centroId: string) {
    return this.subjectsRepository.findAll(centroId);
  }

  findOne(id: string, centroId: string) {
    const asignatura = this.subjectsRepository.findById(id, centroId);
    if (!asignatura) throw new NotFoundException('Subject not found');
    return asignatura;
  }

  create(dto: CreateSubjectDto, centroId: string) {
    return this.subjectsRepository.create({ ...dto, centroId });
  }

  findAssignments(centroId: string, docenteId?: string) {
    return this.subjectsRepository.findAssignments(centroId, docenteId);
  }

  createAssignment(dto: CreateAssignmentDto, centroId: string) {
    return this.subjectsRepository.createAssignment({ ...dto, centroId });
  }
}
