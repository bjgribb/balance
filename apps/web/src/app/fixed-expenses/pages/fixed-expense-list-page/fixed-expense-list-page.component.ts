import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { ToastMessageService } from '../../../shared/toast-message/toast-message.service';
import {
  FixedExpenseDialogComponent,
  type FixedExpenseDialogData,
} from '../../components/fixed-expense-dialog/fixed-expense-dialog.component';
import {
  type CreateFixedExpenseRequest,
  type FixedExpenseResponse,
  RecurrenceUnit,
  type UpdateFixedExpenseRequest,
} from '../../models/fixed-expense.models';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';

@Component({
  selector: 'app-fixed-expense-list-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './fixed-expense-list-page.component.html',
  styleUrl: './fixed-expense-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedExpenseListPageComponent {
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fixedExpenseApi = inject(FixedExpenseApiService);
  private readonly toastMessage = inject(ToastMessageService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly updating = signal(false);
  protected readonly deletingExpenseId = signal<string | null>(null);
  protected readonly expenses = signal<FixedExpenseResponse[]>([]);
  protected readonly loadError = signal(false);

  constructor() {
    this.loadExpenses();
  }

  protected trackById(index: number, expense: FixedExpenseResponse): string {
    void index;
    return expense.id;
  }

  protected recurrenceLabel(expense: FixedExpenseResponse): string {
    const interval = expense.recurrenceInterval;
    const unit = this.toUnitLabel(expense.recurrenceUnit, interval);
    return `Every ${interval} ${unit}`;
  }

  protected nextDueDateLabel(expense: FixedExpenseResponse): string {
    return expense.nextDueDate ?? '';
  }

  protected reload(): void {
    this.loadExpenses();
  }

  protected isBusy(): boolean {
    return this.loading() || this.saving() || this.updating() || this.deletingExpenseId() !== null;
  }

  protected openAddExpenseDialog(): void {
    this.openExpenseDialog({ mode: 'create' })
      .afterClosed()
      .subscribe((payload: CreateFixedExpenseRequest | undefined) => {
        if (!payload) {
          return;
        }

        this.createExpense(payload);
      });
  }

  protected openEditExpenseDialog(expense: FixedExpenseResponse): void {
    this.openExpenseDialog({ mode: 'edit', expense })
      .afterClosed()
      .subscribe((payload: UpdateFixedExpenseRequest | undefined) => {
        if (!payload) {
          return;
        }

        this.updateExpense(expense.id, payload);
      });
  }

  private createExpense(payload: CreateFixedExpenseRequest): void {
    this.saving.set(true);

    this.fixedExpenseApi
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (expense) => {
          this.expenses.update((current) => [expense, ...current]);
          this.toastMessage.success(
            'Fixed expense added',
            `${expense.name} was added to your list.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.toastMessage.error(
            'Unable to add fixed expense',
            fromService ?? this.extractCreateApiError(error),
          );
        },
      });
  }

  private updateExpense(expenseId: string, payload: UpdateFixedExpenseRequest): void {
    this.updating.set(true);

    this.fixedExpenseApi
      .update(expenseId, payload)
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe({
        next: (updatedExpense) => {
          this.expenses.update((current) =>
            current.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)),
          );
          this.toastMessage.success(
            'Fixed expense updated',
            `${updatedExpense.name} was updated successfully.`,
          );
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.toastMessage.error(
            'Unable to update fixed expense',
            fromService ?? this.extractUpdateApiError(error),
          );
        },
      });
  }

  protected isDeleting(expenseId: string): boolean {
    return this.deletingExpenseId() === expenseId;
  }

  protected deleteExpense(expense: FixedExpenseResponse): void {
    this.confirmDialog
      .confirm({
        title: 'Remove Fixed Expense?',
        message: `This will permanently remove ${expense.name} from your fixed expenses. This action cannot be undone.`,
        confirmLabel: 'Remove',
        cancelLabel: 'Cancel',
        confirmColor: 'warn',
        icon: 'warning',
      })
      .subscribe((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.deletingExpenseId.set(expense.id);

        this.fixedExpenseApi
          .delete(expense.id)
          .pipe(finalize(() => this.deletingExpenseId.set(null)))
          .subscribe({
            next: () => {
              this.expenses.update((current) => current.filter((item) => item.id !== expense.id));
              this.toastMessage.success(
                'Fixed expense removed',
                `${expense.name} was removed from your list.`,
              );
            },
            error: (error: HttpErrorResponse) => {
              const fromService = this.fixedExpenseApi.errorMessage();
              this.toastMessage.error(
                'Unable to remove fixed expense',
                fromService ?? this.extractDeleteApiError(error),
              );
            },
          });
      });
  }

  private openExpenseDialog(data: FixedExpenseDialogData) {
    return this.dialog.open(FixedExpenseDialogComponent, {
      autoFocus: false,
      restoreFocus: true,
      width: 'min(42rem, calc(100vw - 1rem))',
      maxWidth: 'calc(100vw - 1rem)',
      data,
    });
  }

  private loadExpenses(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.fixedExpenseApi
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (expenses) => {
          this.expenses.set(expenses);
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.loadError.set(true);
          this.toastMessage.error(
            'Unable to load fixed expenses',
            fromService ?? this.extractApiError(error),
          );
        },
      });
  }

  private toUnitLabel(recurrenceUnit: RecurrenceUnit, interval: number): string {
    const plural = interval === 1 ? '' : 's';

    switch (recurrenceUnit) {
      case RecurrenceUnit.Day:
        return `day${plural}`;
      case RecurrenceUnit.Week:
        return `week${plural}`;
      default:
        return `month${plural}`;
    }
  }

  private extractApiError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot reach the API right now. Please check your connection and try again.';
    }

    return 'Unable to load your fixed expenses right now.';
  }

  private extractCreateApiError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot reach the API right now. Please check your connection and try again.';
    }

    return 'Unable to add this fixed expense right now.';
  }

  private extractUpdateApiError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot reach the API right now. Please check your connection and try again.';
    }

    return 'Unable to update this fixed expense right now.';
  }

  private extractDeleteApiError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Cannot reach the API right now. Please check your connection and try again.';
    }

    return 'Unable to remove this fixed expense right now.';
  }
}
