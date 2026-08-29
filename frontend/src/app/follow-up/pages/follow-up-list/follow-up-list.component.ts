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
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { NotificationService } from '../../../core/services/notification.service';

type Categoria = 'Académico' | 'Familiar/Hogar' | 'Emocional/Social';

@Component({
  selector: 'app-follow-up-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TopBarComponent],
  templateUrl: './follow-up-list.component.html',
})
export class FollowUpListComponent {
  private readonly followUpService = inject(FollowUpService);
  private readonly studentsService = inject(StudentsService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly notification = inject(NotificationService);

  readonly recent = signal<SeguimientoOrientador[]>([]);
  readonly students = signal<Estudiante[]>([]);
  readonly message = signal<string | null>(null);
  readonly saving = signal(false);
  readonly categoria = signal<Categoria>('Académico');
  readonly categorias: Categoria[] = ['Académico', 'Familiar/Hogar', 'Emocional/Social'];

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
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.message.set(null);
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.followUpService
      .create({ ...value, proximaCita: value.proximaCita || undefined } as any)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.notification.success('Bitácora registrada correctamente.');
          this.form.reset();
          this.categoria.set('Académico');
          this.loadRecent();
        },
        error: (err) => {
          this.saving.set(false);
          const message = err?.error?.message ?? 'No se pudo registrar el seguimiento.';
          this.message.set(message);
          this.notification.error(message);
        },
      });
  }
}
