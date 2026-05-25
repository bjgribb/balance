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
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import {
  type CreateFixedExpenseRequest,
  type FixedExpenseResponse,
  RecurrenceUnit,
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
  private readonly fixedExpenseApi = inject(FixedExpenseApiService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly expenses = signal<FixedExpenseResponse[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly createErrorMessage = signal<string | null>(null);
  protected readonly createSuccessMessage = signal<string | null>(null);

  protected readonly recurrenceOptions: readonly RecurrenceOption[] = [
    { value: RecurrenceUnit.Day, label: 'Day(s)' },
    { value: RecurrenceUnit.Week, label: 'Week(s)' },
    { value: RecurrenceUnit.Month, label: 'Month(s)' },
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

  private toApiDate(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
