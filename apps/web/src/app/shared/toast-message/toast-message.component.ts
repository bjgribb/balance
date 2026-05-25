import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type ToastMessageType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessageData {
  readonly title: string;
  readonly message: string;
  readonly type: ToastMessageType;
  readonly actionLabel?: string;
}

@Component({
  selector: 'app-toast-message',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './toast-message.component.html',
  styleUrl: './toast-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastMessageComponent {
  protected readonly data = inject<ToastMessageData>(MAT_SNACK_BAR_DATA);
  private readonly snackBarRef = inject(MatSnackBarRef<ToastMessageComponent>);

  protected get icon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  protected get actionLabel(): string {
    return this.data.actionLabel ?? 'Dismiss';
  }

  protected dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
