import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClassroomObservationsRepository } from './classroom-observations.repository';
import { StudentsRepository } from '../students/students.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { CreateClassroomObservationDto, UpdateClassroomObservationDto } from './dto/classroom-observation.dto';

@Injectable()
export class ClassroomObservationsService {
  private readonly logger = new Logger(ClassroomObservationsService.name);

  constructor(
    private readonly observationsRepository: ClassroomObservationsRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly subjectsRepository: SubjectsRepository,
  ) {}

  private async ensureDocenteAsignadoAlEstudiante(estudianteId: string, centroId: string, docenteId: string) {
    const estudiante = await this.studentsRepository.findById(estudianteId, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');

    const asignaciones = await this.subjectsRepository.findAssignments(centroId, docenteId);
    const tieneAsignacion = asignaciones.some((a) => a.cursoId === estudiante.cursoId);
    if (!tieneAsignacion) {
      throw new ForbiddenException('No tiene una asignación docente para el curso de este estudiante.');
    }

    return estudiante;
  }

  async findByStudent(estudianteId: string, centroId: string, docenteId: string) {
    await this.ensureDocenteAsignadoAlEstudiante(estudianteId, centroId, docenteId);
    return this.observationsRepository.findByStudent(estudianteId, centroId);
  }

  async create(dto: CreateClassroomObservationDto, centroId: string, docenteId: string) {
    const estudiante = await this.ensureDocenteAsignadoAlEstudiante(dto.estudianteId, centroId, docenteId);

    if (dto.asignaturaId) {
      const asignaciones = await this.subjectsRepository.findAssignments(centroId, docenteId);
      const asignaturaValida = asignaciones.some(
        (a) => a.cursoId === estudiante.cursoId && a.asignaturaId === dto.asignaturaId,
      );
      if (!asignaturaValida) {
        throw new ForbiddenException('La asignatura indicada no corresponde a una asignación de este docente.');
      }
    }

    const observacion = await this.observationsRepository.create({
      centroId,
      estudianteId: dto.estudianteId,
      cursoId: estudiante.cursoId,
      asignaturaId: dto.asignaturaId ?? null,
      docenteId,
      categoria: dto.categoria,
      fecha: dto.fecha,
      descripcion: dto.descripcion,
    });

    this.logger.log(`Observación de aula creada (id=${observacion.id}, estudianteId=${dto.estudianteId}, docenteId=${docenteId})`);
    return observacion;
  }

  async update(id: string, centroId: string, docenteId: string, dto: UpdateClassroomObservationDto) {
    const observacion = await this.observationsRepository.findById(id, centroId);
    if (!observacion) throw new NotFoundException('Observation not found');
    if (observacion.docenteId !== docenteId) {
      throw new ForbiddenException('Solo el docente autor puede editar esta observación.');
    }

    const updated = await this.observationsRepository.update(id, centroId, dto);
    this.logger.log(`Observación de aula actualizada (id=${id}, docenteId=${docenteId})`);
    return updated;
  }

  async remove(id: string, centroId: string, docenteId: string) {
    const observacion = await this.observationsRepository.findById(id, centroId);
    if (!observacion) throw new NotFoundException('Observation not found');
    if (observacion.docenteId !== docenteId) {
      throw new ForbiddenException('Solo el docente autor puede eliminar esta observación.');
    }

    await this.observationsRepository.remove(id, centroId);
    this.logger.log(`Observación de aula eliminada (id=${id}, docenteId=${docenteId})`);
    return { id };
  }
}
