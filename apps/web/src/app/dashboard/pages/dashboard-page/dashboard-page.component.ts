import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  FixedExpenseResponse,
  RecurrenceUnit,
} from '../../../fixed-expenses/models/fixed-expense.models';
import { FixedExpenseApiService } from '../../../fixed-expenses/services/fixed-expense-api.service';
import {
  PayFrequency,
  PayScheduleResponse,
} from '../../../pay-schedule/models/pay-schedule.models';
import { PayScheduleApiService } from '../../../pay-schedule/services/pay-schedule-api.service';
import { CurrentPayPeriodCardComponent } from '../../components/current-pay-period-card/current-pay-period-card.component';
import {
  FixedExpenseSummaryCardComponent,
  PayPeriodUpcomingExpenseItem,
} from '../../components/fixed-expense-summary-card/fixed-expense-summary-card.component';

interface FixedExpenseOccurrence {
  readonly id: string;
  readonly name: string;
  readonly amount: number;
  readonly dueDate: Date;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrentPayPeriodCardComponent, FixedExpenseSummaryCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

  private readonly payScheduleApi = inject(PayScheduleApiService);
  private readonly fixedExpenseApi = inject(FixedExpenseApiService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly paySchedule = signal<PayScheduleResponse | null>(null);
  protected readonly fixedExpensesLoading = signal(true);
  protected readonly fixedExpensesLoadError = signal(false);
  protected readonly fixedExpenses = signal<FixedExpenseResponse[]>([]);

  protected readonly hasPaySchedule = computed(() => this.paySchedule() !== null);
  protected readonly currentPeriod = computed(() => {
    const schedule = this.paySchedule();
    if (!schedule) {
      return null;
    }

    return this.resolveCurrentPeriod(schedule, this.todayDate());
  });
  protected readonly periodStart = computed(() => this.currentPeriod()?.start ?? null);
  protected readonly periodEnd = computed(() => this.currentPeriod()?.end ?? null);
  protected readonly daysRemaining = computed(() => {
    const end = this.currentPeriod()?.end;
    if (!end) {
      return 0;
    }

    return Math.max(0, this.daysBetween(this.todayDate(), end));
  });
  protected readonly progressPercent = computed(() => {
    const period = this.currentPeriod();
    if (!period) {
      return 0;
    }

    const totalDays = Math.max(1, this.daysBetween(period.start, period.end));
    const elapsedDays = Math.max(
      0,
      Math.min(totalDays, this.daysBetween(period.start, this.todayDate())),
    );

    return (elapsedDays / totalDays) * 100;
  });
  protected readonly dueFixedExpensesThisPeriod = computed<readonly FixedExpenseOccurrence[]>(
    () => {
      const period = this.currentPeriod();
      if (!period) {
        return [];
      }

      const start = period.start;
      const end = period.end;

      return this.fixedExpenses().flatMap((expense) => {
        if (!expense.isActive) {
          return [];
        }

        const dueDate = this.resolveOccurrenceInRange(expense, start, end);
        if (!dueDate) {
          return [];
        }

        return [
          {
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            dueDate,
          },
        ];
      });
    },
  );
  protected readonly totalFixedExpensesDueThisPeriod = computed(() =>
    this.dueFixedExpensesThisPeriod().reduce((sum, expense) => sum + expense.amount, 0),
  );
  protected readonly fixedExpenseCountThisPeriod = computed(
    () => this.dueFixedExpensesThisPeriod().length,
  );
  protected readonly pendingFixedExpensesThisPeriod = computed<
    readonly PayPeriodUpcomingExpenseItem[]
  >(() => {
    const today = this.todayDate();

    return this.dueFixedExpensesThisPeriod()
      .filter((expense) => this.compareDates(expense.dueDate, today) >= 0)
      .sort((left, right) => this.compareDates(left.dueDate, right.dueDate))
      .map((expense) => ({
        id: expense.id,
        name: expense.name,
        dueDateLabel: this.formatMonthDay(expense.dueDate),
        amount: expense.amount,
      }));
  });
  protected readonly paidFixedExpensesThisPeriod = computed<
    readonly PayPeriodUpcomingExpenseItem[]
  >(() => {
    const today = this.todayDate();

    return this.dueFixedExpensesThisPeriod()
      .filter((expense) => this.compareDates(expense.dueDate, today) < 0)
      .sort((left, right) => this.compareDates(left.dueDate, right.dueDate))
      .map((expense) => ({
        id: expense.id,
        name: expense.name,
        dueDateLabel: this.formatMonthDay(expense.dueDate),
        amount: expense.amount,
      }));
  });

  constructor() {
    this.loadPaySchedule();
    this.loadFixedExpenses();
  }

  private loadPaySchedule(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.payScheduleApi
      .get()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (schedule) => {
          this.paySchedule.set(schedule);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.paySchedule.set(null);
            return;
          }

          this.loadError.set(true);
        },
      });
  }

  private loadFixedExpenses(): void {
    this.fixedExpensesLoading.set(true);
    this.fixedExpensesLoadError.set(false);

    this.fixedExpenseApi
      .getAll()
      .pipe(finalize(() => this.fixedExpensesLoading.set(false)))
      .subscribe({
        next: (expenses) => {
          this.fixedExpenses.set(expenses);
        },
        error: () => {
          this.fixedExpensesLoadError.set(true);
        },
      });
  }

  private resolveCurrentPeriod(
    schedule: PayScheduleResponse,
    today: Date,
  ): { start: Date; end: Date } {
    let start = this.parseApiDate(schedule.anchorPayDate);

    if (this.compareDates(start, today) <= 0) {
      while (true) {
        const next = this.shiftByFrequency(start, schedule.frequency, 1);
        if (this.compareDates(next, today) > 0) {
          return { start, end: next };
        }

        start = next;
      }
    }

    let end = start;
    while (this.compareDates(start, today) > 0) {
      end = start;
      start = this.shiftByFrequency(start, schedule.frequency, -1);
    }

    return { start, end };
  }

  private shiftByFrequency(date: Date, frequency: PayFrequency, direction: 1 | -1): Date {
    switch (frequency) {
      case PayFrequency.Weekly:
        return this.addDays(date, 7 * direction);
      case PayFrequency.BiWeekly:
        return this.addDays(date, 14 * direction);
      case PayFrequency.SemiMonthly:
        return this.addDays(date, 15 * direction);
      case PayFrequency.Monthly:
        return this.addMonths(date, direction);
      default:
        return date;
    }
  }

  private addDays(date: Date, amount: number): Date {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + amount);
    return this.startOfDay(shifted);
  }

  private addMonths(date: Date, amount: number): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const firstOfTarget = new Date(year, month + amount, 1);
    const lastDay = new Date(
      firstOfTarget.getFullYear(),
      firstOfTarget.getMonth() + 1,
      0,
    ).getDate();

    return this.startOfDay(
      new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), Math.min(day, lastDay)),
    );
  }

  private parseApiDate(value: string): Date {
    const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
    return this.startOfDay(new Date(year, month - 1, day));
  }

  private todayDate(): Date {
    return this.startOfDay(new Date());
  }

  private startOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private compareDates(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
  }

  private resolveOccurrenceInRange(
    expense: FixedExpenseResponse,
    start: Date,
    end: Date,
  ): Date | null {
    if (!expense.nextDueDate) {
      return null;
    }

    let candidate = this.parseApiDate(expense.nextDueDate);
    const maxIterations = 240;
    let iterations = 0;

    while (this.compareDates(candidate, end) >= 0 && iterations < maxIterations) {
      candidate = this.shiftExpenseDate(candidate, expense, -1);
      iterations += 1;
    }

    if (this.compareDates(candidate, start) < 0 || this.compareDates(candidate, end) >= 0) {
      return null;
    }

    if (expense.skipUntilDate) {
      const skipUntil = this.parseApiDate(expense.skipUntilDate);
      if (this.compareDates(candidate, skipUntil) < 0) {
        return null;
      }
    }

    return candidate;
  }

  private shiftExpenseDate(date: Date, expense: FixedExpenseResponse, direction: 1 | -1): Date {
    const step = Math.max(1, expense.recurrenceInterval) * direction;

    switch (expense.recurrenceUnit) {
      case RecurrenceUnit.Day:
        return this.addDays(date, step);
      case RecurrenceUnit.Week:
        return this.addDays(date, step * 7);
      case RecurrenceUnit.Month:
        return this.addMonths(date, step);
      default:
        return date;
    }
  }

  private formatMonthDay(value: Date): string {
    return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private daysBetween(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / DashboardPageComponent.DAY_IN_MS);
  }
}
