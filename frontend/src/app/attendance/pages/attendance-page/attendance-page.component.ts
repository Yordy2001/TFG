import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectsService } from '../../../subjects/subjects.service';
import { CoursesService } from '../../../courses/courses.service';
import { StudentsService } from '../../../students/students.service';
import { AttendanceService } from '../../attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { AsignacionDocente, Asignatura, Curso, EstadoAsistencia, Estudiante } from '../../../core/models/domain.model';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './attendance-page.component.html',
})
export class AttendancePageComponent {
  readonly assignments = signal<AsignacionDocente[]>([]);
  readonly courses = signal<Curso[]>([]);
  readonly subjects = signal<Asignatura[]>([]);
  readonly selectedAssignmentId = signal<string>('');
  readonly students = signal<Estudiante[]>([]);
  readonly fecha = signal<string>(new Date().toISOString().slice(0, 10));
  readonly registrados = signal<Set<string>>(new Set());
  readonly estados = Object.values(EstadoAsistencia);

  readonly selectedAssignment = computed(() => this.assignments().find((a) => a.id === this.selectedAssignmentId()));

  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
  ) {
    this.coursesService.findAll().subscribe((courses) => this.courses.set(courses));
    this.subjectsService.findAll().subscribe((subjects) => this.subjects.set(subjects));
    this.subjectsService.findAssignments(this.authService.user()?.id).subscribe((assignments) => {
      this.assignments.set(assignments);
      if (assignments.length) this.selectAssignment(assignments[0].id);
    });
  }

  courseName(id: string) {
    return this.courses().find((c) => c.id === id)?.nombre ?? '—';
  }

  subjectName(id: string) {
    return this.subjects().find((s) => s.id === id)?.nombre ?? '—';
  }

  selectAssignment(id: string) {
    this.selectedAssignmentId.set(id);
    this.registrados.set(new Set());
    const assignment = this.assignments().find((a) => a.id === id);
    if (assignment) {
      this.studentsService.findAll(assignment.cursoId).subscribe((students) => this.students.set(students));
    }
  }

  mark(estudianteId: string, estado: EstadoAsistencia) {
    this.attendanceService
      .register(estudianteId, this.selectedAssignmentId(), this.fecha(), estado)
      .subscribe(() => {
        this.registrados.update((set) => new Set(set).add(estudianteId));
      });
  }
}
