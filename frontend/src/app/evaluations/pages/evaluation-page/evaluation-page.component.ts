import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
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
  imports: [FormsModule, MatIconModule, TopBarComponent],
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
  readonly savingGrades = signal<Record<string, boolean>>({});

  readonly selectedAssignment = computed(() =>
    this.assignments().find((a) => a.id === this.selectedAssignmentId()),
  );

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

  setGrade(actividadId: string, estudianteId: string, value: number) {
    this.grades.update((current) => ({
      ...current,
      [actividadId]: { ...current[actividadId], [estudianteId]: value },
    }));
  }

  private gradeKey(actividadId: string, estudianteId: string) {
    return `${actividadId}:${estudianteId}`;
  }

  isSavingGrade(actividadId: string, estudianteId: string) {
    return !!this.savingGrades()[this.gradeKey(actividadId, estudianteId)];
  }

  saveGrade(actividadId: string, estudianteId: string) {
    const nota = this.gradeFor(actividadId, estudianteId);
    if (nota == null || nota < 0 || nota > 100 || this.isSavingGrade(actividadId, estudianteId)) return;
    const key = this.gradeKey(actividadId, estudianteId);
    this.savingGrades.update((current) => ({ ...current, [key]: true }));
    this.evaluationsService.registerGrade(actividadId, estudianteId, nota).subscribe({
      next: () => {
        this.savingGrades.update((current) => ({ ...current, [key]: false }));
        this.notification.success('Calificación guardada correctamente.');
      },
      error: (err) => {
        this.savingGrades.update((current) => ({ ...current, [key]: false }));
        this.notification.error(err?.error?.message ?? 'No se pudo guardar la calificación.');
      },
    });
  }

  gradeCellClass(actividadId: string, estudianteId: string) {
    const nota = this.gradeFor(actividadId, estudianteId);
    if (nota == null) return 'border-slate-300';
    if (nota < 60) return 'border-[#d92d20] bg-[#fee4e2] text-[#d92d20] font-semibold';
    if (nota < 80) return 'border-amber-300 bg-amber-50 text-amber-700';
    return 'border-green-300 bg-green-50 text-green-700';
  }
}
