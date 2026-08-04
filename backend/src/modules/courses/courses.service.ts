import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  findAll(centroId: string) {
    return this.coursesRepository.findAll(centroId);
  }

  findOne(id: string, centroId: string) {
    const curso = this.coursesRepository.findById(id, centroId);
    if (!curso) throw new NotFoundException('Course not found');
    return curso;
  }

  create(dto: CreateCourseDto, centroId: string) {
    return this.coursesRepository.create({ ...dto, centroId });
  }

  update(id: string, centroId: string, dto: UpdateCourseDto) {
    const curso = this.coursesRepository.update(id, centroId, dto);
    if (!curso) throw new NotFoundException('Course not found');
    return curso;
  }

  remove(id: string, centroId: string) {
    if (this.coursesRepository.hasStudents(id)) {
      throw new BadRequestException('Cannot delete a course that has students');
    }
    const removed = this.coursesRepository.remove(id, centroId);
    if (!removed) throw new NotFoundException('Course not found');
    return { removed: true };
  }
}
