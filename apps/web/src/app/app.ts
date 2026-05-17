import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import { AuthSessionService } from './auth/services/auth-session.service';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly prefersDarkQuery = this.createThemeQuery();
  private topbarResizeObserver?: ResizeObserver;

  @ViewChild('topbar', { read: ElementRef })
  private topbarRef?: ElementRef<HTMLElement>;

  protected readonly title = signal('Balance');

  constructor() {
    this.syncToSystemTheme();

    const onSystemThemeChange = (event: MediaQueryListEvent): void => {
      const mode: ThemeMode = event.matches ? 'dark' : 'light';
      this.applyTheme(mode);
    };

    this.prefersDarkQuery.addEventListener('change', onSystemThemeChange);
    this.destroyRef.onDestroy(() => {
      this.prefersDarkQuery.removeEventListener('change', onSystemThemeChange);
    });
  }

  ngAfterViewInit(): void {
    this.syncTopbarHeight();

    const topbar = this.topbarRef?.nativeElement;
    if (topbar && 'ResizeObserver' in window) {
      this.topbarResizeObserver = new ResizeObserver(() => {
        this.syncTopbarHeight();
      });

      this.topbarResizeObserver.observe(topbar);
      this.destroyRef.onDestroy(() => {
        this.topbarResizeObserver?.disconnect();
      });
    }

    const onWindowResize = (): void => {
      this.syncTopbarHeight();
    };

    window.addEventListener('resize', onWindowResize, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', onWindowResize);
    });
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

  private syncTopbarHeight(): void {
    const topbarHeight = this.topbarRef?.nativeElement.getBoundingClientRect().height;
    if (!topbarHeight || topbarHeight <= 0) {
      return;
    }

    const roundedHeight = Math.ceil(topbarHeight);
    this.hostElement.nativeElement.style.setProperty('--topbar-height', `${roundedHeight}px`);
  }
}
