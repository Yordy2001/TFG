import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title class="text-base font-semibold text-slate-900">{{ data.title }}</h2>
    <mat-dialog-content class="text-sm text-slate-600">{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" (click)="dialogRef.close(false)">
        {{ data.cancelLabel ?? 'Cancelar' }}
      </button>
      <button type="button" class="btn-primary" (click)="dialogRef.close(true)" cdkFocusInitial>
        {{ data.confirmLabel ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);
  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
