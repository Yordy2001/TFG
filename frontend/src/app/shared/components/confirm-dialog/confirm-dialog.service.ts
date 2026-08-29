import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

/**
 * Ticket GDE-002: acciones destructivas deben pedir confirmación explícita
 * antes de enviarse al backend (prevención de errores).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData) {
    return this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px', autoFocus: 'first-tabbable' })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
