import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubjectsService } from '../../../subjects/subjects.service';
import { CoursesService } from '../../../courses/courses.service';
import { StudentsService } from '../../../students/students.service';
import { AttendanceService } from '../../attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { AsignacionDocente, Asignatura, Curso, EstadoAsistencia, Estudiante } from '../../../core/models/domain.model';

const ESTADO_LABELS: Record<EstadoAsistencia, string> = {
  [EstadoAsistencia.PRESENTE]: 'Presente',
  [EstadoAsistencia.TARDANZA]: 'Atraso',
  [EstadoAsistencia.AUSENTE]: 'Ausente',
};

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [FormsModule, TopBarComponent],
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
  readonly marks = signal<Record<string, EstadoAsistencia>>({});
  readonly savingStudentIds = signal<Set<string>>(new Set());
  readonly estados = Object.values(EstadoAsistencia);
  readonly EstadoAsistencia = EstadoAsistencia;

  readonly totalPresentes = computed(
    () => Object.values(this.marks()).filter((e) => e === EstadoAsistencia.PRESENTE).length,
  );
  readonly totalAusentes = computed(
    () => Object.values(this.marks()).filter((e) => e === EstadoAsistencia.AUSENTE).length,
  );
  readonly totalTardanzas = computed(
    () => Object.values(this.marks()).filter((e) => e === EstadoAsistencia.TARDANZA).length,
  );

  readonly selectedAssignment = computed(() => this.assignments().find((a) => a.id === this.selectedAssignmentId()));

  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly attendanceService: AttendanceService,
    private readonly authService: AuthService,
    private readonly notification: NotificationService,
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
    this.marks.set({});
    const assignment = this.assignments().find((a) => a.id === id);
    if (assignment) {
      this.studentsService.findAll(assignment.cursoId).subscribe((students) => this.students.set(students));
    }
  }

  isSaving(estudianteId: string) {
    return this.savingStudentIds().has(estudianteId);
  }

  mark(estudianteId: string, estado: EstadoAsistencia) {
    if (this.isSaving(estudianteId)) return;
    this.savingStudentIds.update((set) => new Set(set).add(estudianteId));
    this.attendanceService
      .register(estudianteId, this.selectedAssignmentId(), this.fecha(), estado)
      .subscribe({
        next: () => {
          this.registrados.update((set) => new Set(set).add(estudianteId));
          this.marks.update((current) => ({ ...current, [estudianteId]: estado }));
          this.savingStudentIds.update((set) => {
            const next = new Set(set);
            next.delete(estudianteId);
            return next;
          });
          this.notification.success('Asistencia registrada correctamente.');
        },
        error: (err) => {
          this.savingStudentIds.update((set) => {
            const next = new Set(set);
            next.delete(estudianteId);
            return next;
          });
          this.notification.error(err?.error?.message ?? 'No se pudo registrar la asistencia.');
        },
      });
  }

  estadoLabel(estado: EstadoAsistencia) {
    return ESTADO_LABELS[estado];
  }
}
