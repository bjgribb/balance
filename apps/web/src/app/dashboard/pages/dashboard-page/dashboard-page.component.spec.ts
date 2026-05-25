import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RecurrenceUnit } from '../../../fixed-expenses/models/fixed-expense.models';
import { FixedExpenseApiService } from '../../../fixed-expenses/services/fixed-expense-api.service';
import { PayFrequency } from '../../../pay-schedule/models/pay-schedule.models';
import { PayScheduleApiService } from '../../../pay-schedule/services/pay-schedule-api.service';
import { DashboardPageComponent } from './dashboard-page.component';

class PayScheduleApiServiceStub {
  readonly get = vi.fn();
}

class FixedExpenseApiServiceStub {
  readonly getAll = vi.fn();
}

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let payScheduleApiStub: PayScheduleApiServiceStub;
  let fixedExpenseApiStub: FixedExpenseApiServiceStub;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20));

    payScheduleApiStub = new PayScheduleApiServiceStub();
    fixedExpenseApiStub = new FixedExpenseApiServiceStub();

    payScheduleApiStub.get.mockReturnValue(
      of({
        id: 'schedule-1',
        frequency: PayFrequency.BiWeekly,
        anchorPayDate: '2026-05-01',
        estimatedPayAmount: 2400,
        createdAtUtc: '2026-05-01T00:00:00Z',
      }),
    );
    fixedExpenseApiStub.getAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        { provide: PayScheduleApiService, useValue: payScheduleApiStub },
        { provide: FixedExpenseApiService, useValue: fixedExpenseApiStub },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders current pay period details when pay schedule exists', () => {
    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Current Pay Period');
    expect(html.textContent).toContain('May 15 - May 29');
    expect(html.textContent).toContain('9 days remaining');
  });

  it('shows empty state when pay schedule has not been set up', () => {
    payScheduleApiStub.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Add your pay schedule to see this period at a glance.');
  });

  it('shows an error state when pay schedule API fails', () => {
    payScheduleApiStub.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Could not load your pay period details.');
  });

  it('renders fixed expense totals due in the current period', () => {
    fixedExpenseApiStub.getAll.mockReturnValue(
      of([
        {
          id: 'expense-1',
          name: 'Spotify',
          amount: 10.99,
          isActive: true,
          anchorDate: '2026-05-01',
          recurrenceUnit: RecurrenceUnit.Month,
          recurrenceInterval: 1,
          skipUntilDate: null,
          nextDueDate: '2026-05-18',
          createdAtUtc: '2026-05-01T00:00:00Z',
        },
        {
          id: 'expense-2',
          name: 'Internet',
          amount: 60,
          isActive: true,
          anchorDate: '2026-05-01',
          recurrenceUnit: RecurrenceUnit.Month,
          recurrenceInterval: 1,
          skipUntilDate: null,
          nextDueDate: '2026-05-24',
          createdAtUtc: '2026-05-01T00:00:00Z',
        },
        {
          id: 'expense-3',
          name: 'Out of period expense',
          amount: 100,
          isActive: true,
          anchorDate: '2026-05-01',
          recurrenceUnit: RecurrenceUnit.Month,
          recurrenceInterval: 1,
          skipUntilDate: null,
          nextDueDate: '2026-06-01',
          createdAtUtc: '2026-05-01T00:00:00Z',
        },
        {
          id: 'expense-4',
          name: 'Phone Plan',
          amount: 30,
          isActive: true,
          anchorDate: '2026-05-18',
          recurrenceUnit: RecurrenceUnit.Month,
          recurrenceInterval: 1,
          skipUntilDate: null,
          nextDueDate: '2026-06-18',
          createdAtUtc: '2026-05-01T00:00:00Z',
        },
      ]),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Fixed Expense Summary');
    expect(html.textContent).toContain('$100.99');
    expect(html.textContent).toContain('3 expenses due this period');
    expect(html.textContent).toContain('Pending this pay period');
    expect(html.textContent).toContain('Paid this pay period');
    expect(html.textContent).toContain('Internet');
    expect(html.textContent).toContain('Spotify');
    expect(html.textContent).toContain('Phone Plan');
  });

  it('shows an error state when fixed expense summary fails to load', () => {
    fixedExpenseApiStub.getAll.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Could not load fixed expense summary.');
    expect(html.textContent).not.toContain('Could not load upcoming expenses.');
  });
});
