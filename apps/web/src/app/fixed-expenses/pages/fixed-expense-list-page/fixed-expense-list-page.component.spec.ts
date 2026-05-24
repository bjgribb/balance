import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FixedExpenseApiService } from '../../services/fixed-expense-api.service';
import { FixedExpenseListPageComponent } from './fixed-expense-list-page.component';

class FixedExpenseApiServiceStub {
  readonly errorMessage = signal<string | null>(null);
  readonly getAll = vi.fn().mockReturnValue(of([]));
}

describe('FixedExpenseListPageComponent', () => {
  let fixture: ComponentFixture<FixedExpenseListPageComponent>;
  let apiStub: FixedExpenseApiServiceStub;

  beforeEach(async () => {
    apiStub = new FixedExpenseApiServiceStub();

    await TestBed.configureTestingModule({
      imports: [FixedExpenseListPageComponent],
      providers: [{ provide: FixedExpenseApiService, useValue: apiStub }],
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
});
