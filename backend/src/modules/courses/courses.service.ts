import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  findAll(centroId: string) {
    return this.coursesRepository.findAll(centroId);
  }

  async findOne(id: string, centroId: string) {
    const curso = await this.coursesRepository.findById(id, centroId);
    if (!curso) throw new NotFoundException('Course not found');
    return curso;
  }

  create(dto: CreateCourseDto, centroId: string) {
    return this.coursesRepository.create({ ...dto, centroId });
  }

  async update(id: string, centroId: string, dto: UpdateCourseDto) {
    const curso = await this.coursesRepository.update(id, centroId, dto);
    if (!curso) throw new NotFoundException('Course not found');
    return curso;
  }

  async remove(id: string, centroId: string) {
    if (await this.coursesRepository.hasStudents(id)) {
      throw new BadRequestException('Cannot delete a course that has students');
    }
    const removed = await this.coursesRepository.remove(id, centroId);
    if (!removed) throw new NotFoundException('Course not found');
    return { removed: true };
  }
}
