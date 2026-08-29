import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
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
  readonly pendingIds = signal<Set<string>>(new Set());
  readonly marks = signal<Record<string, EstadoAsistencia>>({});
  readonly saving = signal(false);
  readonly estados = Object.values(EstadoAsistencia);
  readonly EstadoAsistencia = EstadoAsistencia;

  readonly hasPending = computed(() => this.pendingIds().size > 0);

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
    this.pendingIds.set(new Set());
    this.marks.set({});
    const assignment = this.assignments().find((a) => a.id === id);
    if (assignment) {
      this.studentsService.findAll(assignment.cursoId).subscribe((students) => this.students.set(students));
    }
  }

  mark(estudianteId: string, estado: EstadoAsistencia) {
    if (this.saving()) return;
    this.marks.update((current) => ({ ...current, [estudianteId]: estado }));
    this.pendingIds.update((set) => new Set(set).add(estudianteId));
  }

  saveAttendance() {
    if (this.saving() || !this.hasPending()) return;
    const ids = Array.from(this.pendingIds());
    this.saving.set(true);

    const requests = ids.map((estudianteId) =>
      this.attendanceService
        .register(estudianteId, this.selectedAssignmentId(), this.fecha(), this.marks()[estudianteId])
        .pipe(
          map(() => ({ estudianteId, ok: true as const })),
          catchError((err) => of({ estudianteId, ok: false as const, message: err?.error?.message as string | undefined })),
        ),
    );

    forkJoin(requests).subscribe((results) => {
      this.saving.set(false);
      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      this.registrados.update((set) => {
        const next = new Set(set);
        succeeded.forEach((r) => next.add(r.estudianteId));
        return next;
      });
      this.pendingIds.update((set) => {
        const next = new Set(set);
        succeeded.forEach((r) => next.delete(r.estudianteId));
        return next;
      });

      if (failed.length === 0) {
        this.notification.success(`Asistencia guardada correctamente (${succeeded.length} estudiante(s)).`);
      } else if (succeeded.length === 0) {
        this.notification.error('No se pudo guardar la asistencia. Intente nuevamente.');
      } else {
        this.notification.error(
          `${succeeded.length} registrada(s), ${failed.length} con error. Reintente las pendientes.`,
        );
      }
    });
  }

  estadoLabel(estado: EstadoAsistencia) {
    return ESTADO_LABELS[estado];
  }
}
