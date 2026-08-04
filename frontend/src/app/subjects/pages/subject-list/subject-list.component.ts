import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SubjectsService } from '../../subjects.service';
import { Asignatura } from '../../../core/models/domain.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './subject-list.component.html',
})
export class SubjectListComponent {
  private readonly subjectsService = inject(SubjectsService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  readonly subjects = signal<Asignatura[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);

  readonly canManage = computed(() => this.authService.user()?.role === Role.ADMINISTRADOR);

  readonly form = this.fb.group({ nombre: ['', Validators.required] });

  constructor() {
    this.load();
  }

  private load() {
    this.subjectsService.findAll().subscribe((subjects) => {
      this.subjects.set(subjects);
      this.loading.set(false);
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.subjectsService.create(this.form.getRawValue().nombre!).subscribe(() => {
      this.form.reset();
      this.showForm.set(false);
      this.load();
    });
  }
}
