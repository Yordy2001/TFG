import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { catchError, forkJoin, map, of } from 'rxjs';
import { SubjectsService } from '../../../subjects/subjects.service';
import { CoursesService } from '../../../courses/courses.service';
import { StudentsService } from '../../../students/students.service';
import { EvaluationsService } from '../../evaluations.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { CreateActivityDialogComponent } from '../../components/create-activity-dialog/create-activity-dialog.component';
import { AsignacionDocente, Asignatura, Curso, Estudiante, ActividadEvaluacion } from '../../../core/models/domain.model';

@Component({
  selector: 'app-evaluation-page',
  standalone: true,
  imports: [FormsModule, TopBarComponent],
  templateUrl: './evaluation-page.component.html',
})
export class EvaluationPageComponent {
  private readonly subjectsService = inject(SubjectsService);
  private readonly coursesService = inject(CoursesService);
  private readonly studentsService = inject(StudentsService);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly assignments = signal<AsignacionDocente[]>([]);
  readonly courses = signal<Curso[]>([]);
  readonly subjects = signal<Asignatura[]>([]);
  readonly selectedAssignmentId = signal<string>('');
  readonly activities = signal<ActividadEvaluacion[]>([]);
  readonly students = signal<Estudiante[]>([]);
  readonly grades = signal<Record<string, Record<string, number>>>({});
  readonly dirtyKeys = signal<Set<string>>(new Set());
  readonly savingGrades = signal(false);

  readonly selectedAssignment = computed(() =>
    this.assignments().find((a) => a.id === this.selectedAssignmentId()),
  );
  readonly hasDirtyGrades = computed(() => this.dirtyKeys().size > 0);

  constructor() {
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
    this.dirtyKeys.set(new Set());
    this.loadActivities();
    const assignment = this.assignments().find((a) => a.id === id);
    if (assignment) {
      this.studentsService.findAll(assignment.cursoId).subscribe((students) => this.students.set(students));
    }
  }

  private loadActivities() {
    this.evaluationsService.activitiesByAssignment(this.selectedAssignmentId()).subscribe((acts) => {
      this.activities.set(acts);
    });
  }

  openCreateActivityDialog() {
    this.dialog
      .open(CreateActivityDialogComponent, {
        data: { asignacionDocenteId: this.selectedAssignmentId() },
        width: '520px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((activity) => {
        if (activity) this.activities.update((current) => [...current, activity]);
      });
  }

  gradeFor(actividadId: string, estudianteId: string): number | null {
    return this.grades()[actividadId]?.[estudianteId] ?? null;
  }

  isDirty(actividadId: string, estudianteId: string) {
    return this.dirtyKeys().has(this.gradeKey(actividadId, estudianteId));
  }

  setGrade(actividadId: string, estudianteId: string, value: number | null) {
    if (value !== null && (Number.isNaN(value) || value < 0 || value > 100)) {
      this.notification.error('La calificación debe estar entre 0 y 100.');
      return;
    }
    this.grades.update((current) => ({
      ...current,
      [actividadId]: { ...current[actividadId], [estudianteId]: value as number },
    }));
    const key = this.gradeKey(actividadId, estudianteId);
    if (value === null) {
      this.dirtyKeys.update((set) => {
        const next = new Set(set);
        next.delete(key);
        return next;
      });
    } else {
      this.dirtyKeys.update((set) => new Set(set).add(key));
    }
  }

  private gradeKey(actividadId: string, estudianteId: string) {
    return `${actividadId}:${estudianteId}`;
  }

  saveAllGrades() {
    if (this.savingGrades() || !this.hasDirtyGrades()) return;
    const keys = Array.from(this.dirtyKeys());
    this.savingGrades.set(true);

    const requests = keys.map((key) => {
      const [actividadId, estudianteId] = key.split(':');
      const nota = this.gradeFor(actividadId, estudianteId)!;
      return this.evaluationsService.registerGrade(actividadId, estudianteId, nota).pipe(
        map(() => ({ key, ok: true as const })),
        catchError((err) => of({ key, ok: false as const, message: err?.error?.message as string | undefined })),
      );
    });

    forkJoin(requests).subscribe((results) => {
      this.savingGrades.set(false);
      const succeeded = results.filter((r) => r.ok);
      const failed = results.filter((r) => !r.ok);

      this.dirtyKeys.update((set) => {
        const next = new Set(set);
        succeeded.forEach((r) => next.delete(r.key));
        return next;
      });

      if (failed.length === 0) {
        this.notification.success(`${succeeded.length} calificación(es) guardada(s) correctamente.`);
      } else if (succeeded.length === 0) {
        this.notification.error('No se pudo guardar ninguna calificación. Intente nuevamente.');
      } else {
        this.notification.error(
          `${succeeded.length} calificación(es) guardada(s), ${failed.length} con error. Corrija y reintente.`,
        );
      }
    });
  }

  onGradeKeydown(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'];
    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    const willExceedLength =
      input.value.length >= 3 && input.selectionStart === input.selectionEnd;
    if (willExceedLength) {
      event.preventDefault();
    }
  }

  onGradePaste(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!/^[0-9]{1,3}$/.test(text)) {
      event.preventDefault();
    }
  }

  gradeCellClass(actividadId: string, estudianteId: string) {
    const nota = this.gradeFor(actividadId, estudianteId);
    if (nota == null) return 'border-slate-300';
    if (nota < 60) return 'border-[#d92d20] bg-[#fee4e2] text-[#d92d20] font-semibold';
    if (nota < 80) return 'border-amber-300 bg-amber-50 text-amber-700';
    return 'border-green-300 bg-green-50 text-green-700';
  }
}
