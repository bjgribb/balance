import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { type Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent, type ConfirmDialogData } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  confirm(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        data,
        autoFocus: false,
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
