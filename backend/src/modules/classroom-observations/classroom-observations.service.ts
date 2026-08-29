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

  private ensureDocenteAsignadoAlEstudiante(estudianteId: string, centroId: string, docenteId: string) {
    const estudiante = this.studentsRepository.findById(estudianteId, centroId);
    if (!estudiante) throw new NotFoundException('Student not found');

    const asignaciones = this.subjectsRepository.findAssignments(centroId, docenteId);
    const tieneAsignacion = asignaciones.some((a) => a.cursoId === estudiante.cursoId);
    if (!tieneAsignacion) {
      throw new ForbiddenException('No tiene una asignación docente para el curso de este estudiante.');
    }

    return estudiante;
  }

  findByStudent(estudianteId: string, centroId: string, docenteId: string) {
    this.ensureDocenteAsignadoAlEstudiante(estudianteId, centroId, docenteId);
    return this.observationsRepository.findByStudent(estudianteId, centroId);
  }

  create(dto: CreateClassroomObservationDto, centroId: string, docenteId: string) {
    const estudiante = this.ensureDocenteAsignadoAlEstudiante(dto.estudianteId, centroId, docenteId);

    if (dto.asignaturaId) {
      const asignaciones = this.subjectsRepository.findAssignments(centroId, docenteId);
      const asignaturaValida = asignaciones.some(
        (a) => a.cursoId === estudiante.cursoId && a.asignaturaId === dto.asignaturaId,
      );
      if (!asignaturaValida) {
        throw new ForbiddenException('La asignatura indicada no corresponde a una asignación de este docente.');
      }
    }

    const observacion = this.observationsRepository.create({
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

  update(id: string, centroId: string, docenteId: string, dto: UpdateClassroomObservationDto) {
    const observacion = this.observationsRepository.findById(id, centroId);
    if (!observacion) throw new NotFoundException('Observation not found');
    if (observacion.docenteId !== docenteId) {
      throw new ForbiddenException('Solo el docente autor puede editar esta observación.');
    }

    const updated = this.observationsRepository.update(id, centroId, dto);
    this.logger.log(`Observación de aula actualizada (id=${id}, docenteId=${docenteId})`);
    return updated;
  }

  remove(id: string, centroId: string, docenteId: string) {
    const observacion = this.observationsRepository.findById(id, centroId);
    if (!observacion) throw new NotFoundException('Observation not found');
    if (observacion.docenteId !== docenteId) {
      throw new ForbiddenException('Solo el docente autor puede eliminar esta observación.');
    }

    this.observationsRepository.remove(id, centroId);
    this.logger.log(`Observación de aula eliminada (id=${id}, docenteId=${docenteId})`);
    return { id };
  }
}
