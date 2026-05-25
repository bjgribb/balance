import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface UpcomingExpenseItem {
  readonly id: string;
  readonly name: string;
  readonly dueDate: Date;
  readonly amount: number;
}

@Component({
  selector: 'app-upcoming-expenses-card',
  imports: [MatCardModule, DatePipe, CurrencyPipe],
  templateUrl: './upcoming-expenses-card.component.html',
  styleUrl: './upcoming-expenses-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingExpensesCardComponent {
  readonly loading = input(false);
  readonly loadError = input(false);
  readonly hasPaySchedule = input(false);
  readonly periodStart = input<Date | null>(null);
  readonly periodEnd = input<Date | null>(null);
  readonly expenses = input<readonly UpcomingExpenseItem[]>([]);

  protected trackById(index: number, expense: UpcomingExpenseItem): string {
    void index;
    return expense.id;
  }
}
