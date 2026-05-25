import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RecurrenceUnit } from '../../models/fixed-expense.models';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';
import { FixedExpenseListPageComponent } from './fixed-expense-list-page.component';

class FixedExpenseApiServiceStub {
  readonly errorMessage = signal<string | null>(null);
  readonly getAll = vi.fn().mockReturnValue(of([]));
  readonly create = vi.fn().mockReturnValue(
    of({
      id: 'created-expense-id',
      name: 'Internet',
      amount: 79.99,
      isActive: true,
      anchorDate: '2026-05-05',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-05',
      createdAtUtc: '2026-05-01T00:00:00Z',
    }),
  );
}

describe('FixedExpenseListPageComponent', () => {
  let fixture: ComponentFixture<FixedExpenseListPageComponent>;
  let apiStub: FixedExpenseApiServiceStub;

  beforeEach(async () => {
    apiStub = new FixedExpenseApiServiceStub();

    await TestBed.configureTestingModule({
      imports: [FixedExpenseListPageComponent],
      providers: [
        provideNativeDateAdapter(),
        { provide: FixedExpenseApiService, useValue: apiStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FixedExpenseListPageComponent);
  });

  it('shows an empty state when no fixed expenses exist', () => {
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('No fixed expenses yet');
  });

  it('shows an error state when the API request fails', () => {
    apiStub.getAll.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    fixture = TestBed.createComponent(FixedExpenseListPageComponent);
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Unable to load your fixed expenses right now.');
  });

  it('submits create form and appends the new expense to the list', () => {
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      createForm: {
        setValue(value: {
          name: string;
          amount: number;
          anchorDate: Date;
          recurrenceUnit: RecurrenceUnit;
          recurrenceInterval: number;
          skipUntilDate: null;
          isActive: boolean;
        }): void;
      };
      submitCreate(): void;
    };

    component.createForm.setValue({
      name: 'Internet',
      amount: 79.99,
      anchorDate: new Date(2026, 4, 5),
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      isActive: true,
    });

    component.submitCreate();
    fixture.detectChanges();

    expect(apiStub.create).toHaveBeenCalledWith({
      name: 'Internet',
      amount: 79.99,
      anchorDate: '2026-05-05',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      isActive: true,
    });

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Fixed expense added.');
    expect(html.textContent).toContain('Internet');
  });

  it('shows a create error when adding an expense fails', () => {
    fixture.detectChanges();
    apiStub.create.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    const component = fixture.componentInstance as unknown as {
      createForm: {
        setValue(value: {
          name: string;
          amount: number;
          anchorDate: Date;
          recurrenceUnit: RecurrenceUnit;
          recurrenceInterval: number;
          skipUntilDate: null;
          isActive: boolean;
        }): void;
      };
      submitCreate(): void;
    };
    component.createForm.setValue({
      name: 'Internet',
      amount: 79.99,
      anchorDate: new Date(2026, 4, 5),
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      isActive: true,
    });

    component.submitCreate();
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Unable to add this fixed expense right now.');
  });
});
