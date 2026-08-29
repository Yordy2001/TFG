import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StudentsService, ImportPreviewResult, ImportConfirmResult, ImportRowStatus } from '../../students.service';
import { NotificationService } from '../../../core/services/notification.service';

const ROW_LABELS: Record<ImportRowStatus, string> = {
  valida: 'Válida',
  advertencia: 'Advertencia',
  error: 'Error',
};

const ROW_BADGE_CLASSES: Record<ImportRowStatus, string> = {
  valida: 'bg-green-100 text-green-700',
  advertencia: 'bg-amber-100 text-amber-700',
  error: 'bg-[#fee4e2] text-[#d92d20]',
};

@Component({
  selector: 'app-import-students-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './import-students-dialog.component.html',
})
export class ImportStudentsDialogComponent {
  private readonly studentsService = inject(StudentsService);
  private readonly notification = inject(NotificationService);
  readonly dialogRef = inject(MatDialogRef<ImportStudentsDialogComponent, boolean>);

  readonly file = signal<File | null>(null);
  readonly preview = signal<ImportPreviewResult | null>(null);
  readonly result = signal<ImportConfirmResult | null>(null);
  readonly loadingPreview = signal(false);
  readonly confirming = signal(false);
  readonly downloadingTemplate = signal(false);

  private importedAny = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0] ?? null;
    this.file.set(selected);
    this.preview.set(null);
    this.result.set(null);
  }

  downloadTemplate() {
    if (this.downloadingTemplate()) return;
    this.downloadingTemplate.set(true);
    this.studentsService.downloadImportTemplate().subscribe({
      next: (blob) => {
        this.downloadingTemplate.set(false);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'plantilla-estudiantes.xlsx';
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloadingTemplate.set(false);
        this.notification.error(err?.error?.message ?? 'No se pudo descargar la plantilla.');
      },
    });
  }

  runPreview() {
    const file = this.file();
    if (!file || this.loadingPreview()) return;
    this.loadingPreview.set(true);
    this.studentsService.previewImport(file).subscribe({
      next: (report) => {
        this.loadingPreview.set(false);
        this.preview.set(report);
        if (report.invalidas > 0) {
          this.notification.error(`${report.invalidas} fila(s) tienen errores. Revise el detalle antes de continuar.`);
        } else {
          this.notification.success('Archivo validado correctamente. Revise la vista previa antes de importar.');
        }
      },
      error: (err) => {
        this.loadingPreview.set(false);
        this.notification.error(err?.error?.message ?? 'No se pudo procesar el archivo.');
      },
    });
  }

  confirmImport() {
    const file = this.file();
    if (!file || this.confirming()) return;
    this.confirming.set(true);
    this.studentsService.confirmImport(file).subscribe({
      next: (summary) => {
        this.confirming.set(false);
        this.result.set(summary);
        if (summary.importados > 0) this.importedAny = true;
        this.notification.success(`Importación completada: ${summary.importados} de ${summary.total} estudiantes importados.`);
      },
      error: (err) => {
        this.confirming.set(false);
        this.notification.error(err?.error?.message ?? 'No se pudo completar la importación.');
      },
    });
  }

  rowStatusLabel(estado: ImportRowStatus) {
    return ROW_LABELS[estado];
  }

  rowBadgeClass(estado: ImportRowStatus) {
    return ROW_BADGE_CLASSES[estado];
  }

  close() {
    this.dialogRef.close(this.importedAny);
  }
}
