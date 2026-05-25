import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, throwError, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  type CreateFixedExpenseRequest,
  type FixedExpenseResponse,
} from '../models/fixed-expense.models';

@Injectable({
  providedIn: 'root',
})
export class FixedExpenseApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/api/fixed-expenses`;

  readonly errorMessage = signal<string | null>(null);

  getAll(): Observable<FixedExpenseResponse[]> {
    this.errorMessage.set(null);

    return this.http.get<FixedExpenseResponse[]>(this.url).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorMessage.set(
          this.extractApiError(error, 'Unable to load your fixed expenses right now.'),
        );
        return throwError(() => error);
      }),
    );
  }

  create(request: CreateFixedExpenseRequest): Observable<FixedExpenseResponse> {
    this.errorMessage.set(null);

    return this.http.post<FixedExpenseResponse>(this.url, request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorMessage.set(
          this.extractApiError(error, 'Unable to add this fixed expense right now.'),
        );
        return throwError(() => error);
      }),
    );
  }

  private extractApiError(error: HttpErrorResponse, fallback: string): string {
    const payload = error.error;
    if (
      payload &&
      typeof payload === 'object' &&
      Array.isArray((payload as { errors?: unknown }).errors)
    ) {
      const errors = (payload as { errors: string[] }).errors;
      if (errors.length > 0) {
        return errors.join(' ');
      }
    }

    if (error.status === 0) {
      return 'Cannot reach the API right now. Please check your connection and try again.';
    }

    return fallback;
  }
}
