import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EvaluationsService } from '../../evaluations.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ActividadEvaluacion, Competencia, PeriodoEvaluativo } from '../../../core/models/domain.model';

export interface CreateActivityDialogData {
  asignacionDocenteId: string;
}

@Component({
  selector: 'app-create-activity-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './create-activity-dialog.component.html',
})
export class CreateActivityDialogComponent {
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly data = inject<CreateActivityDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<CreateActivityDialogComponent, ActividadEvaluacion | null>);

  readonly saving = signal(false);
  readonly competencias = Object.values(Competencia);
  readonly periodos = Object.values(PeriodoEvaluativo);

  readonly form = this.fb.group({
    nombre: ['', Validators.required],
    competencia: [Competencia.C1_COMUNICATIVA, Validators.required],
    porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    periodoEvaluativo: [PeriodoEvaluativo.P1, Validators.required],
    fecha: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.dialogRef.disableClose = true;
    this.evaluationsService
      .createActivity({ ...this.form.getRawValue(), asignacionDocenteId: this.data.asignacionDocenteId } as any)
      .subscribe({
        next: (activity) => {
          this.saving.set(false);
          this.notification.success('Actividad de evaluación creada correctamente.');
          this.dialogRef.close(activity);
        },
        error: (err) => {
          this.saving.set(false);
          this.dialogRef.disableClose = false;
          this.notification.error(err?.error?.message ?? 'No se pudo crear la actividad.');
        },
      });
  }

  cancel() {
    if (this.saving()) return;
    this.dialogRef.close(null);
  }
}
