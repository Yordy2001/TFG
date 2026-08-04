import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoursesService } from '../../courses.service';
import { Curso } from '../../../core/models/domain.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent {
  private readonly coursesService = inject(CoursesService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  readonly courses = signal<Curso[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);

  readonly canManage = computed(() => {
    const role = this.authService.user()?.role;
    return role === Role.ADMINISTRADOR || role === Role.REGISTRO;
  });

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    gradoNivel: ['', Validators.required],
    seccion: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  private load() {
    this.coursesService.findAll().subscribe((courses) => {
      this.courses.set(courses);
      this.loading.set(false);
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.coursesService.create(this.form.getRawValue() as any).subscribe(() => {
      this.form.reset();
      this.showForm.set(false);
      this.load();
    });
  }
}
