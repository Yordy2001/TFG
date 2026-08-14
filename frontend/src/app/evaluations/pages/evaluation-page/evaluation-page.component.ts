import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SubjectsService } from '../../../subjects/subjects.service';
import { CoursesService } from '../../../courses/courses.service';
import { StudentsService } from '../../../students/students.service';
import { EvaluationsService } from '../../evaluations.service';
import { AuthService } from '../../../core/services/auth.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { AsignacionDocente, Asignatura, Competencia, Curso, Estudiante, PeriodoEvaluativo, ActividadEvaluacion } from '../../../core/models/domain.model';

@Component({
  selector: 'app-evaluation-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TopBarComponent],
  templateUrl: './evaluation-page.component.html',
})
export class EvaluationPageComponent {
  private readonly subjectsService = inject(SubjectsService);
  private readonly coursesService = inject(CoursesService);
  private readonly studentsService = inject(StudentsService);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly assignments = signal<AsignacionDocente[]>([]);
  readonly courses = signal<Curso[]>([]);
  readonly subjects = signal<Asignatura[]>([]);
  readonly selectedAssignmentId = signal<string>('');
  readonly activities = signal<ActividadEvaluacion[]>([]);
  readonly students = signal<Estudiante[]>([]);
  readonly grades = signal<Record<string, Record<string, number>>>({});
  readonly message = signal<string | null>(null);

  readonly competencias = Object.values(Competencia);
  readonly periodos = Object.values(PeriodoEvaluativo);

  readonly selectedAssignment = computed(() =>
    this.assignments().find((a) => a.id === this.selectedAssignmentId()),
  );

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    competencia: [Competencia.C1_COMUNICATIVA, Validators.required],
    porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    periodoEvaluativo: [PeriodoEvaluativo.P1, Validators.required],
    fecha: ['', Validators.required],
  });

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

  createActivity() {
    if (this.form.invalid) return;
    this.message.set(null);
    this.evaluationsService
      .createActivity({ ...this.form.getRawValue(), asignacionDocenteId: this.selectedAssignmentId() } as any)
      .subscribe({
        next: () => {
          this.form.reset({ competencia: Competencia.C1_COMUNICATIVA, porcentaje: 10, periodoEvaluativo: PeriodoEvaluativo.P1 });
          this.loadActivities();
        },
        error: (err) => this.message.set(err?.error?.message ?? 'No se pudo crear la actividad.'),
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

  saveGrade(actividadId: string, estudianteId: string) {
    const nota = this.gradeFor(actividadId, estudianteId);
    if (nota == null) return;
    this.evaluationsService.registerGrade(actividadId, estudianteId, nota).subscribe();
  }

  gradeCellClass(actividadId: string, estudianteId: string) {
    const nota = this.gradeFor(actividadId, estudianteId);
    if (nota == null) return 'border-slate-300';
    if (nota < 60) return 'border-[#d92d20] bg-[#fee4e2] text-[#d92d20] font-semibold';
    if (nota < 80) return 'border-amber-300 bg-amber-50 text-amber-700';
    return 'border-green-300 bg-green-50 text-green-700';
  }
}
