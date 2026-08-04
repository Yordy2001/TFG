import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { FollowUpService } from '../../follow-up.service';
import { StudentsService } from '../../../students/students.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Estudiante, SeguimientoOrientador } from '../../../core/models/domain.model';
import { API_BASE_URL } from '../../../core/config/api.config';

@Component({
  selector: 'app-follow-up-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './follow-up-list.component.html',
})
export class FollowUpListComponent {
  private readonly followUpService = inject(FollowUpService);
  private readonly studentsService = inject(StudentsService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly recent = signal<SeguimientoOrientador[]>([]);
  readonly students = signal<Estudiante[]>([]);
  readonly showForm = signal(false);
  readonly message = signal<string | null>(null);

  readonly form = this.fb.group({
    estudianteId: ['', Validators.required],
    fecha: ['', Validators.required],
    motivo: ['', Validators.required],
    observaciones: ['', Validators.required],
    acciones: ['', Validators.required],
    proximaCita: [''],
  });

  constructor() {
    this.studentsService.findAll().subscribe((students) => this.students.set(students));
    this.loadRecent();
  }

  private loadRecent() {
    this.http
      .get<ApiResponse<SeguimientoOrientador[]>>(`${API_BASE_URL}/follow-up/recent`)
      .pipe(map((res) => res.data))
      .subscribe((data) => this.recent.set(data));
  }

  studentName(id: string) {
    const s = this.students().find((e) => e.id === id);
    return s ? `${s.nombres} ${s.apellidos}` : '—';
  }

  submit() {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.followUpService
      .create({ ...value, proximaCita: value.proximaCita || undefined } as any)
      .subscribe({
        next: () => {
          this.form.reset();
          this.showForm.set(false);
          this.loadRecent();
        },
        error: () => this.message.set('No se pudo registrar el seguimiento.'),
      });
  }
}
