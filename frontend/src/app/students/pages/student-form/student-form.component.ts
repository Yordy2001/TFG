import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService } from '../../students.service';
import { CoursesService } from '../../../courses/courses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Curso, Sexo } from '../../../core/models/domain.model';

const MAX_MATRICULA_RETRIES = 5;

/** First letter of nombre + first letter of each of the first two apellido tokens + AAMMDD (fecha de registro). */
function matriculaPrefix(nombres: string, apellidos: string): string {
  const nombreInitial = nombres.trim().charAt(0).toUpperCase();
  const tokens = apellidos.trim().split(/\s+/).filter(Boolean);
  const apellido1Initial = (tokens[0]?.charAt(0) ?? '').toUpperCase();
  const apellido2Initial = (tokens[1]?.charAt(0) ?? tokens[0]?.charAt(0) ?? '').toUpperCase();
  if (!nombreInitial || !apellido1Initial) return '';

  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${nombreInitial}${apellido1Initial}${apellido2Initial}${yy}${mm}${dd}`;
}

function generateMatricula(nombres: string, apellidos: string, existing: string[]): string {
  const prefix = matriculaPrefix(nombres, apellidos);
  if (!prefix) return '';
  const count = existing.filter((m) => m.startsWith(prefix)).length;
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './student-form.component.html',
})
export class StudentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly studentsService = inject(StudentsService);
  private readonly coursesService = inject(CoursesService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly courses = signal<Curso[]>([]);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sexos = Object.values(Sexo);

  private existingMatriculas: string[] = [];

  readonly form = this.fb.group({
    matricula: [{ value: '', disabled: true }, Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    sexo: [Sexo.M, Validators.required],
    fechaNacimiento: ['', Validators.required],
    cursoId: ['', Validators.required],
  });

  constructor() {
    this.coursesService.findAll().subscribe((courses) => this.courses.set(courses));
    this.studentsService.findAll().subscribe((students) => {
      this.existingMatriculas = students.map((s) => s.matricula);
    });
    this.form.controls.nombres.valueChanges.subscribe(() => this.updateMatricula());
    this.form.controls.apellidos.valueChanges.subscribe(() => this.updateMatricula());
  }

  private updateMatricula() {
    const nombres = this.form.controls.nombres.value ?? '';
    const apellidos = this.form.controls.apellidos.value ?? '';
    this.form.controls.matricula.setValue(generateMatricula(nombres, apellidos, this.existingMatriculas));
  }

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    this.createStudent(0);
  }

  private createStudent(attempt: number) {
    const payload = this.form.getRawValue();
    this.studentsService.create(payload as any).subscribe({
      next: (student) => {
        this.saving.set(false);
        this.notification.success('Estudiante creado correctamente.');
        this.router.navigate(['/students', student.id]);
      },
      error: (err) => {
        const message: string = err?.error?.message ?? '';
        const isDuplicateMatricula = message.toLowerCase().includes('matr') && message.toLowerCase().includes('exist');
        if (isDuplicateMatricula && attempt < MAX_MATRICULA_RETRIES) {
          this.existingMatriculas = [...this.existingMatriculas, payload.matricula!];
          this.updateMatricula();
          this.createStudent(attempt + 1);
          return;
        }

        this.saving.set(false);
        const displayMessage = err?.error?.message ?? 'No se pudo crear el estudiante.';
        this.errorMessage.set(displayMessage);
        this.notification.error(displayMessage);
      },
    });
  }
}
