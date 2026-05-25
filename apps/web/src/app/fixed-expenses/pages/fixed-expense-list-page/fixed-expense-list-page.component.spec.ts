import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';
import { RecurrenceUnit } from '../../models/fixed-expense.models';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';
import { FixedExpenseListPageComponent } from './fixed-expense-list-page.component';

class ConfirmDialogServiceStub {
  confirmed = true;

  readonly confirm = vi.fn().mockImplementation(() => of(this.confirmed));
}

class FixedExpenseApiServiceStub {
  readonly errorMessage = signal<string | null>(null);
  readonly getAll = vi.fn().mockReturnValue(
    of([
      {
        id: 'existing-expense-id',
        name: 'Electric Bill',
        amount: 120,
        isActive: true,
        anchorDate: '2026-05-01',
        recurrenceUnit: RecurrenceUnit.Month,
        recurrenceInterval: 1,
        skipUntilDate: null,
        nextDueDate: '2026-06-01',
        createdAtUtc: '2026-05-01T00:00:00Z',
      },
    ]),
  );
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
  readonly update = vi.fn().mockReturnValue(
    of({
      id: 'existing-expense-id',
      name: 'Electric Bill Updated',
      amount: 125,
      isActive: false,
      anchorDate: '2026-05-10',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: null,
      createdAtUtc: '2026-05-01T00:00:00Z',
    }),
  );
  readonly delete = vi.fn().mockReturnValue(of(void 0));
}

describe('FixedExpenseListPageComponent', () => {
  let fixture: ComponentFixture<FixedExpenseListPageComponent>;
  let apiStub: FixedExpenseApiServiceStub;
  let confirmDialogStub: ConfirmDialogServiceStub;

  beforeEach(async () => {
    apiStub = new FixedExpenseApiServiceStub();
    confirmDialogStub = new ConfirmDialogServiceStub();

    await TestBed.configureTestingModule({
      imports: [FixedExpenseListPageComponent],
      providers: [
        provideNativeDateAdapter(),
        { provide: ConfirmDialogService, useValue: confirmDialogStub },
        { provide: FixedExpenseApiService, useValue: apiStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FixedExpenseListPageComponent);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an empty state when no fixed expenses exist', () => {
    apiStub.getAll.mockReturnValue(of([]));
    fixture = TestBed.createComponent(FixedExpenseListPageComponent);
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

  it('submits edit form and updates the existing expense', () => {
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      startEdit(expense: {
        id: string;
        name: string;
        amount: number;
        isActive: boolean;
        anchorDate: string;
        recurrenceUnit: RecurrenceUnit;
        recurrenceInterval: number;
        skipUntilDate: string | null;
        nextDueDate: string | null;
        createdAtUtc: string;
      }): void;
      editForm: {
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
      submitUpdate(expenseId: string): void;
    };

    component.startEdit({
      id: 'existing-expense-id',
      name: 'Electric Bill',
      amount: 120,
      isActive: true,
      anchorDate: '2026-05-01',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-01',
      createdAtUtc: '2026-05-01T00:00:00Z',
    });

    component.editForm.setValue({
      name: 'Electric Bill Updated',
      amount: 125,
      anchorDate: new Date(2026, 4, 10),
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      isActive: false,
    });

    component.submitUpdate('existing-expense-id');
    fixture.detectChanges();

    expect(apiStub.update).toHaveBeenCalledWith('existing-expense-id', {
      name: 'Electric Bill Updated',
      amount: 125,
      anchorDate: '2026-05-10',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      isActive: false,
    });

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Fixed expense updated.');
    expect(html.textContent).toContain('Electric Bill Updated');
  });

  it('shows an update error when saving an edit fails', () => {
    fixture.detectChanges();
    apiStub.update.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    const component = fixture.componentInstance as unknown as {
      startEdit(expense: {
        id: string;
        name: string;
        amount: number;
        isActive: boolean;
        anchorDate: string;
        recurrenceUnit: RecurrenceUnit;
        recurrenceInterval: number;
        skipUntilDate: string | null;
        nextDueDate: string | null;
        createdAtUtc: string;
      }): void;
      submitUpdate(expenseId: string): void;
    };

    component.startEdit({
      id: 'existing-expense-id',
      name: 'Electric Bill',
      amount: 120,
      isActive: true,
      anchorDate: '2026-05-01',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-01',
      createdAtUtc: '2026-05-01T00:00:00Z',
    });

    component.submitUpdate('existing-expense-id');
    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Unable to update this fixed expense right now.');
  });

  it('removes an expense when delete is confirmed', () => {
    fixture.detectChanges();
    confirmDialogStub.confirmed = true;

    const component = fixture.componentInstance as unknown as {
      deleteExpense(expense: {
        id: string;
        name: string;
        amount: number;
        isActive: boolean;
        anchorDate: string;
        recurrenceUnit: RecurrenceUnit;
        recurrenceInterval: number;
        skipUntilDate: string | null;
        nextDueDate: string | null;
        createdAtUtc: string;
      }): void;
    };

    component.deleteExpense({
      id: 'existing-expense-id',
      name: 'Electric Bill',
      amount: 120,
      isActive: true,
      anchorDate: '2026-05-01',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-01',
      createdAtUtc: '2026-05-01T00:00:00Z',
    });

    fixture.detectChanges();

    expect(confirmDialogStub.confirm).toHaveBeenCalled();
    expect(apiStub.delete).toHaveBeenCalledWith('existing-expense-id');

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Fixed expense removed.');
    expect(html.textContent).not.toContain('Electric Bill');
  });

  it('does not call delete when confirmation is canceled', () => {
    fixture.detectChanges();
    confirmDialogStub.confirmed = false;

    const component = fixture.componentInstance as unknown as {
      deleteExpense(expense: {
        id: string;
        name: string;
        amount: number;
        isActive: boolean;
        anchorDate: string;
        recurrenceUnit: RecurrenceUnit;
        recurrenceInterval: number;
        skipUntilDate: string | null;
        nextDueDate: string | null;
        createdAtUtc: string;
      }): void;
    };

    component.deleteExpense({
      id: 'existing-expense-id',
      name: 'Electric Bill',
      amount: 120,
      isActive: true,
      anchorDate: '2026-05-01',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-01',
      createdAtUtc: '2026-05-01T00:00:00Z',
    });

    expect(confirmDialogStub.confirm).toHaveBeenCalled();
    expect(apiStub.delete).not.toHaveBeenCalled();
  });

  it('shows a delete error when removing an expense fails', () => {
    fixture.detectChanges();
    confirmDialogStub.confirmed = true;
    apiStub.delete.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
    );

    const component = fixture.componentInstance as unknown as {
      deleteExpense(expense: {
        id: string;
        name: string;
        amount: number;
        isActive: boolean;
        anchorDate: string;
        recurrenceUnit: RecurrenceUnit;
        recurrenceInterval: number;
        skipUntilDate: string | null;
        nextDueDate: string | null;
        createdAtUtc: string;
      }): void;
    };

    component.deleteExpense({
      id: 'existing-expense-id',
      name: 'Electric Bill',
      amount: 120,
      isActive: true,
      anchorDate: '2026-05-01',
      recurrenceUnit: RecurrenceUnit.Month,
      recurrenceInterval: 1,
      skipUntilDate: null,
      nextDueDate: '2026-06-01',
      createdAtUtc: '2026-05-01T00:00:00Z',
    });

    fixture.detectChanges();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Unable to remove this fixed expense right now.');
    expect(html.textContent).toContain('Electric Bill');
  });
});
