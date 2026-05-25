import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface PayPeriodUpcomingExpenseItem {
  readonly id: string;
  readonly name: string;
  readonly dueDateLabel: string;
  readonly amount: number;
}

@Component({
  selector: 'app-fixed-expense-summary-card',
  imports: [MatCardModule, CurrencyPipe],
  templateUrl: './fixed-expense-summary-card.component.html',
  styleUrl: './fixed-expense-summary-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixedExpenseSummaryCardComponent {
  readonly loading = input(false);
  readonly loadError = input(false);
  readonly hasPaySchedule = input(false);
  readonly totalDueThisPeriod = input(0);
  readonly dueCountThisPeriod = input(0);
  readonly pendingThisPeriod = input<readonly PayPeriodUpcomingExpenseItem[]>([]);
  readonly paidThisPeriod = input<readonly PayPeriodUpcomingExpenseItem[]>([]);

  protected trackById(index: number, expense: PayPeriodUpcomingExpenseItem): string {
    void index;
    return expense.id;
  }
}
