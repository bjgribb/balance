import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PayFrequency } from '../../../pay-schedule/models/pay-schedule.models';
import { PayScheduleApiService } from '../../../pay-schedule/services/pay-schedule-api.service';
import { DashboardPageComponent } from './dashboard-page.component';

class PayScheduleApiServiceStub {
  readonly get = vi.fn();
}

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let apiStub: PayScheduleApiServiceStub;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20));

    apiStub = new PayScheduleApiServiceStub();

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [{ provide: PayScheduleApiService, useValue: apiStub }],
    }).compileComponents();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders current pay period details when pay schedule exists', () => {
    apiStub.get.mockReturnValue(
      of({
        id: 'schedule-1',
        frequency: PayFrequency.BiWeekly,
        anchorPayDate: '2026-05-01',
        estimatedPayAmount: 2400,
        createdAtUtc: '2026-05-01T00:00:00Z',
      }),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Current Pay Period');
    expect(html.textContent).toContain('May 15 - May 29');
    expect(html.textContent).toContain('9 days remaining');
  });

  it('shows empty state when pay schedule has not been set up', () => {
    apiStub.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' })),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Add your pay schedule to see this period at a glance.');
  });

  it('shows an error state when pay schedule API fails', () => {
    apiStub.get.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Could not load your pay period details.');
  });
});
