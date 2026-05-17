import { Injectable, inject } from '@angular/core';
import { Observable, finalize, shareReplay, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth.models';
import { AuthApiService } from './auth-api.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthRefreshService {
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);
  private inFlightRefresh$?: Observable<AuthResponse>;

  refresh(): Observable<AuthResponse> {
    if (this.inFlightRefresh$) {
      return this.inFlightRefresh$;
    }

    const refreshToken = this.authSession.getRefreshToken();
    if (!refreshToken) {
      this.authSession.clearSession();
      return throwError(() => new Error('Missing refresh token.'));
    }

    this.inFlightRefresh$ = this.authApi.refresh({ refreshToken }).pipe(
      finalize(() => {
        this.inFlightRefresh$ = undefined;
      }),
      shareReplay(1),
    );

    return this.inFlightRefresh$;
  }
}
