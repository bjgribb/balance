import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthSessionService } from './auth/services/auth-session.service';

type ThemeMode = 'light' | 'dark';

interface AppNavItem {
  label: string;
  route: string;
  icon: string;
  activeOptions: IsActiveMatchOptions;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly exactMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    matrixParams: 'ignored',
    queryParams: 'ignored',
    fragment: 'ignored',
  };

  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly prefersDarkQuery = this.createThemeQuery();
  private readonly isAuthRouteSignal = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isAuthUrl(event.urlAfterRedirects)),
      startWith(this.isAuthUrl(this.router.url)),
    ),
    { initialValue: this.isAuthUrl(this.router.url) },
  );

  protected readonly title = signal('Balance');
  protected readonly isAuthenticated = this.authSession.isAuthenticated;
  protected readonly showAppChrome = computed(
    () => this.isAuthenticated() && !this.isAuthRouteSignal(),
  );
  protected readonly navItems: readonly AppNavItem[] = [
    {
      label: 'Overview',
      route: '/dashboard',
      icon: 'home',
      activeOptions: this.exactMatchOptions,
    },
    {
      label: 'Pay Schedule',
      route: '/pay-schedule',
      icon: 'calendar_month',
      activeOptions: this.exactMatchOptions,
    },
  ];
  protected readonly desktopNavItems = this.navItems;
  protected readonly mobileNavItems = this.navItems;

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

  private isAuthUrl(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register');
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
