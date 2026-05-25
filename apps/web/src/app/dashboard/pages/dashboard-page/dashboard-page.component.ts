import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import {
  PayFrequency,
  PayScheduleResponse,
} from '../../../pay-schedule/models/pay-schedule.models';
import { PayScheduleApiService } from '../../../pay-schedule/services/pay-schedule-api.service';
import { CurrentPayPeriodCardComponent } from '../../components/current-pay-period-card/current-pay-period-card.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrentPayPeriodCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

  private readonly payScheduleApi = inject(PayScheduleApiService);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly paySchedule = signal<PayScheduleResponse | null>(null);

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

  constructor() {
    this.loadPaySchedule();
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

  private daysBetween(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / DashboardPageComponent.DAY_IN_MS);
  }
}
