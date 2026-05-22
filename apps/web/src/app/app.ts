import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './auth/services/auth-session.service';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly prefersDarkQuery = this.createThemeQuery();

  protected readonly title = signal('Balance');
  protected readonly isAuthenticated = this.authSession.isAuthenticated;

  constructor() {
    this.syncToSystemTheme();

    const onSystemThemeChange = (event: MediaQueryListEvent): void => {
      const mode: ThemeMode = event.matches ? 'dark' : 'light';
      this.applyTheme(mode);
    };

    this.prefersDarkQuery.addEventListener('change', onSystemThemeChange);
  }

  protected logout(): void {
    this.authSession.clearSession();
    void this.router.navigateByUrl('/login');
  }

  private syncToSystemTheme(): void {
    const mode: ThemeMode = this.prefersDarkQuery.matches ? 'dark' : 'light';
    this.applyTheme(mode);
  }

  private createThemeQuery(): MediaQueryList {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)');
    }

    const noop = (...args: unknown[]): void => {
      void args;
    };
    const alwaysFalse = (event: Event): boolean => {
      void event;
      return false;
    };

    const fallback: MediaQueryList = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: noop as MediaQueryList['addEventListener'],
      removeEventListener: noop as MediaQueryList['removeEventListener'],
      addListener: noop as MediaQueryList['addListener'],
      removeListener: noop as MediaQueryList['removeListener'],
      dispatchEvent: alwaysFalse,
    };

    return fallback;
  }

  private applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');

    if (mode === 'light') {
      root.classList.add('light-theme');
    }

    if (mode === 'dark') {
      root.classList.add('dark-theme');
    }
  }
}
