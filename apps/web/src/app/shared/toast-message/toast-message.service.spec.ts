import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { ToastMessageComponent } from './toast-message.component';
import { ToastMessageService } from './toast-message.service';

describe('ToastMessageService', () => {
  it('opens the shared toast component with the provided data', () => {
    const openFromComponent = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        ToastMessageService,
        {
          provide: MatSnackBar,
          useValue: {
            openFromComponent,
          },
        },
      ],
    });

    const service = TestBed.inject(ToastMessageService);
    service.success('Saved', 'The expense was added.');

    expect(openFromComponent).toHaveBeenCalledTimes(1);
    expect(openFromComponent).toHaveBeenCalledWith(
      ToastMessageComponent,
      expect.objectContaining({
        data: {
          title: 'Saved',
          message: 'The expense was added.',
          type: 'success',
          actionLabel: undefined,
        },
        panelClass: ['app-toast-message-pane', 'app-toast-message-pane--success'],
      }),
    );
  });
});
