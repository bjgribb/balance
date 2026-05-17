import { Injectable, computed, signal } from '@angular/core';
import { AuthResponse } from '../models/auth.models';

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly accessTokenKey = 'auth.accessToken';
  private readonly refreshTokenKey = 'auth.refreshToken';
  private readonly accessTokenExpiresAtKey = 'auth.accessTokenExpiresAt';

  private readonly session = signal<AuthSession | null>(this.readFromStorage());

  readonly isAuthenticated = computed(() => {
    const current = this.session();
    if (!current) {
      return false;
    }

    return current.accessToken.length > 0 && current.accessTokenExpiresAt > Date.now();
  });

  readonly hasRefreshToken = computed(() => {
    return !!this.session()?.refreshToken;
  });

  getAccessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.session()?.refreshToken ?? null;
  }

  setSession(response: AuthResponse): void {
    const expiresAt = Date.parse(response.accessTokenExpiresAtUtc);

    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      accessTokenExpiresAt: Number.isNaN(expiresAt) ? Date.now() : expiresAt,
    };

    this.session.set(nextSession);
    this.writeToStorage(nextSession);
  }

  clearSession(): void {
    this.session.set(null);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenExpiresAtKey);
  }

  private readFromStorage(): AuthSession | null {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const refreshToken = sessionStorage.getItem(this.refreshTokenKey);
    const rawExpiresAt = sessionStorage.getItem(this.accessTokenExpiresAtKey);
    const accessTokenExpiresAt = rawExpiresAt ? Number.parseInt(rawExpiresAt, 10) : Number.NaN;

    if (!accessToken || !refreshToken || Number.isNaN(accessTokenExpiresAt)) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    };
  }

  private writeToStorage(session: AuthSession): void {
    sessionStorage.setItem(this.accessTokenKey, session.accessToken);
    sessionStorage.setItem(this.refreshTokenKey, session.refreshToken);
    sessionStorage.setItem(this.accessTokenExpiresAtKey, session.accessTokenExpiresAt.toString());
  }
}
