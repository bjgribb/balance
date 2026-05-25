import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar,
  type MatSnackBarConfig,
  type MatSnackBarRef,
} from '@angular/material/snack-bar';
import {
  ToastMessageComponent,
  type ToastMessageData,
  type ToastMessageType,
} from './toast-message.component';

export interface ShowToastOptions {
  readonly title: string;
  readonly message: string;
  readonly type: ToastMessageType;
  readonly actionLabel?: string;
  readonly durationMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastMessageService {
  private readonly snackBar = inject(MatSnackBar);

  show(options: ShowToastOptions): MatSnackBarRef<ToastMessageComponent> {
    const data: ToastMessageData = {
      title: options.title,
      message: options.message,
      type: options.type,
      actionLabel: options.actionLabel,
    };

    const config: MatSnackBarConfig<ToastMessageData> = {
      data,
      duration: options.durationMs ?? this.defaultDuration(options.type),
      politeness: options.type === 'error' ? 'assertive' : 'polite',
      panelClass: ['app-toast-message-pane', `app-toast-message-pane--${options.type}`],
    };

    return this.snackBar.openFromComponent(ToastMessageComponent, config);
  }

  success(
    title: string,
    message: string,
    durationMs?: number,
  ): MatSnackBarRef<ToastMessageComponent> {
    return this.show({ title, message, type: 'success', durationMs });
  }

  error(
    title: string,
    message: string,
    durationMs?: number,
  ): MatSnackBarRef<ToastMessageComponent> {
    return this.show({ title, message, type: 'error', durationMs });
  }

  info(title: string, message: string, durationMs?: number): MatSnackBarRef<ToastMessageComponent> {
    return this.show({ title, message, type: 'info', durationMs });
  }

  warning(
    title: string,
    message: string,
    durationMs?: number,
  ): MatSnackBarRef<ToastMessageComponent> {
    return this.show({ title, message, type: 'warning', durationMs });
  }

  private defaultDuration(type: ToastMessageType): number {
    return type === 'error' ? 7000 : 4000;
  }
}
