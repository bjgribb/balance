import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-current-pay-period-card',
  imports: [MatCardModule, DatePipe],
  templateUrl: './current-pay-period-card.component.html',
  styleUrl: './current-pay-period-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentPayPeriodCardComponent {
  readonly loading = input(false);
  readonly loadError = input(false);
  readonly hasPaySchedule = input(false);
  readonly periodStart = input<Date | null>(null);
  readonly periodEnd = input<Date | null>(null);
  readonly daysRemaining = input(0);
  readonly progressPercent = input(0);

  protected readonly clampedProgressPercent = computed(() =>
    Math.max(0, Math.min(100, Math.round(this.progressPercent()))),
  );
}
