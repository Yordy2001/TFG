import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService, UserRecord } from '../../../users/users.service';
import { SchoolsService, CentroEducativo } from '../../../schools/schools.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';

const ROLE_LABELS: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  REGISTRO: 'Registro',
  DIRECTOR: 'Director',
  DOCENTE: 'Docente',
  ORIENTADOR: 'Orientador',
};

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, TopBarComponent],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  private readonly usersService = inject(UsersService);
  private readonly schoolsService = inject(SchoolsService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  readonly profile = signal<UserRecord | null>(null);
  readonly centro = signal<CentroEducativo | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly form = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(1)]],
    apellidos: ['', [Validators.required, Validators.minLength(1)]],
  });

  constructor() {
    this.usersService.findMe().subscribe((profile) => {
      this.profile.set(profile);
      this.form.patchValue({ nombres: profile.nombres, apellidos: profile.apellidos });
      this.loading.set(false);
    });
    this.schoolsService.findMine().subscribe((centro) => this.centro.set(centro));
  }

  roleLabel(rol: string) {
    return ROLE_LABELS[rol] ?? rol;
  }

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { nombres, apellidos } = this.form.getRawValue();
    this.usersService.updateMe({ nombres: nombres!, apellidos: apellidos! }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.profile.set(updated);
        this.authService.updateCurrentUser({ nombres: updated.nombres, apellidos: updated.apellidos });
        this.notification.success('Perfil actualizado correctamente.');
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err?.error?.message ?? 'No se pudo actualizar el perfil.');
      },
    });
  }
}
