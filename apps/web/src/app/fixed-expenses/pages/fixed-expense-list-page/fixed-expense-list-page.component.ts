import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import {
  type CreateFixedExpenseRequest,
  type FixedExpenseResponse,
  RecurrenceUnit,
  type UpdateFixedExpenseRequest,
} from '../../models/fixed-expense.models';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';

interface RecurrenceOption {
  readonly value: RecurrenceUnit;
  readonly label: string;
}

@Component({
  selector: 'app-fixed-expense-list-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './fixed-expense-list-page.component.html',
  styleUrl: './fixed-expense-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedExpenseListPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly fixedExpenseApi = inject(FixedExpenseApiService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly updating = signal(false);
  protected readonly deletingExpenseId = signal<string | null>(null);
  protected readonly expenses = signal<FixedExpenseResponse[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly createErrorMessage = signal<string | null>(null);
  protected readonly createSuccessMessage = signal<string | null>(null);
  protected readonly editingExpenseId = signal<string | null>(null);
  protected readonly updateErrorMessage = signal<string | null>(null);
  protected readonly updateSuccessMessage = signal<string | null>(null);
  protected readonly deleteErrorMessage = signal<string | null>(null);
  protected readonly deleteSuccessMessage = signal<string | null>(null);

  protected readonly recurrenceOptions: readonly RecurrenceOption[] = [
    { value: RecurrenceUnit.Day, label: 'Day' },
    { value: RecurrenceUnit.Week, label: 'Week' },
    { value: RecurrenceUnit.Month, label: 'Month' },
  ];

  protected readonly createForm = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    anchorDate: this.fb.control<Date | null>(null, Validators.required),
    recurrenceUnit: this.fb.control<RecurrenceUnit | null>(
      RecurrenceUnit.Month,
      Validators.required,
    ),
    recurrenceInterval: this.fb.control<number | null>(1, [Validators.required, Validators.min(1)]),
    skipUntilDate: this.fb.control<Date | null>(null),
    isActive: this.fb.control(true, Validators.required),
  });

  protected readonly editForm = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    anchorDate: this.fb.control<Date | null>(null, Validators.required),
    recurrenceUnit: this.fb.control<RecurrenceUnit | null>(null, Validators.required),
    recurrenceInterval: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
    skipUntilDate: this.fb.control<Date | null>(null),
    isActive: this.fb.control(true, Validators.required),
  });

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

  protected submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    const payload: CreateFixedExpenseRequest = {
      name: raw.name!.trim(),
      amount: raw.amount!,
      anchorDate: this.toApiDate(raw.anchorDate!),
      recurrenceUnit: raw.recurrenceUnit!,
      recurrenceInterval: raw.recurrenceInterval!,
      skipUntilDate: raw.skipUntilDate ? this.toApiDate(raw.skipUntilDate) : null,
      isActive: raw.isActive!,
    };

    this.saving.set(true);
    this.createErrorMessage.set(null);
    this.createSuccessMessage.set(null);
    this.deleteSuccessMessage.set(null);

    this.fixedExpenseApi
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (expense) => {
          this.expenses.update((current) => [expense, ...current]);
          this.createSuccessMessage.set('Fixed expense added.');
          this.createForm.reset({
            name: '',
            amount: null,
            anchorDate: null,
            recurrenceUnit: RecurrenceUnit.Month,
            recurrenceInterval: 1,
            skipUntilDate: null,
            isActive: true,
          });
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.createErrorMessage.set(fromService ?? this.extractCreateApiError(error));
        },
      });
  }

  protected isEditing(expenseId: string): boolean {
    return this.editingExpenseId() === expenseId;
  }

  protected startEdit(expense: FixedExpenseResponse): void {
    this.editingExpenseId.set(expense.id);
    this.updateErrorMessage.set(null);
    this.updateSuccessMessage.set(null);
    this.deleteSuccessMessage.set(null);
    this.editForm.reset({
      name: expense.name,
      amount: expense.amount,
      anchorDate: this.fromApiDate(expense.anchorDate),
      recurrenceUnit: expense.recurrenceUnit,
      recurrenceInterval: expense.recurrenceInterval,
      skipUntilDate: expense.skipUntilDate ? this.fromApiDate(expense.skipUntilDate) : null,
      isActive: expense.isActive,
    });
  }

  protected cancelEdit(): void {
    this.editingExpenseId.set(null);
    this.updateErrorMessage.set(null);
  }

  protected submitUpdate(expenseId: string): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    const payload: UpdateFixedExpenseRequest = {
      name: raw.name!.trim(),
      amount: raw.amount!,
      anchorDate: this.toApiDate(raw.anchorDate!),
      recurrenceUnit: raw.recurrenceUnit!,
      recurrenceInterval: raw.recurrenceInterval!,
      skipUntilDate: raw.skipUntilDate ? this.toApiDate(raw.skipUntilDate) : null,
      isActive: raw.isActive!,
    };

    this.updating.set(true);
    this.updateErrorMessage.set(null);
    this.updateSuccessMessage.set(null);
    this.deleteSuccessMessage.set(null);

    this.fixedExpenseApi
      .update(expenseId, payload)
      .pipe(finalize(() => this.updating.set(false)))
      .subscribe({
        next: (updatedExpense) => {
          this.expenses.update((current) =>
            current.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)),
          );
          this.updateSuccessMessage.set('Fixed expense updated.');
          this.editingExpenseId.set(null);
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.updateErrorMessage.set(fromService ?? this.extractUpdateApiError(error));
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
        this.deleteErrorMessage.set(null);
        this.deleteSuccessMessage.set(null);

        this.fixedExpenseApi
          .delete(expense.id)
          .pipe(finalize(() => this.deletingExpenseId.set(null)))
          .subscribe({
            next: () => {
              this.expenses.update((current) => current.filter((item) => item.id !== expense.id));
              if (this.editingExpenseId() === expense.id) {
                this.editingExpenseId.set(null);
              }

              this.deleteSuccessMessage.set('Fixed expense removed.');
            },
            error: (error: HttpErrorResponse) => {
              const fromService = this.fixedExpenseApi.errorMessage();
              this.deleteErrorMessage.set(fromService ?? this.extractDeleteApiError(error));
            },
          });
      });
  }

  private loadExpenses(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.fixedExpenseApi
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (expenses) => {
          this.expenses.set(expenses);
        },
        error: (error: HttpErrorResponse) => {
          const fromService = this.fixedExpenseApi.errorMessage();
          this.errorMessage.set(fromService ?? this.extractApiError(error));
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

  private toApiDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromApiDate(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
    return new Date(year, month - 1, day);
  }
}
