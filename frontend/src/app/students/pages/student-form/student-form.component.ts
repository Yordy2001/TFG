import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService } from '../../students.service';
import { CoursesService } from '../../../courses/courses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Curso, Sexo } from '../../../core/models/domain.model';

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

  readonly form = this.fb.group({
    matricula: ['', Validators.required],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    sexo: [Sexo.M, Validators.required],
    fechaNacimiento: ['', Validators.required],
    cursoId: ['', Validators.required],
  });

  constructor() {
    this.coursesService.findAll().subscribe((courses) => this.courses.set(courses));
  }

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    this.studentsService.create(this.form.getRawValue() as any).subscribe({
      next: (student) => {
        this.saving.set(false);
        this.notification.success('Estudiante creado correctamente.');
        this.router.navigate(['/students', student.id]);
      },
      error: (err) => {
        this.saving.set(false);
        const message = err?.error?.message ?? 'No se pudo crear el estudiante.';
        this.errorMessage.set(message);
        this.notification.error(message);
      },
    });
  }
}
