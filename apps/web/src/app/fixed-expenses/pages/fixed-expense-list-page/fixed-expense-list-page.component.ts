import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { type FixedExpenseResponse, RecurrenceUnit } from '../../models/fixed-expense.models';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';

@Component({
  selector: 'app-fixed-expense-list-page',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './fixed-expense-list-page.component.html',
  styleUrl: './fixed-expense-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedExpenseListPageComponent {
  private readonly fixedExpenseApi = inject(FixedExpenseApiService);

  protected readonly loading = signal(true);
  protected readonly expenses = signal<FixedExpenseResponse[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

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
}
