import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly darkModeQuery = '(prefers-color-scheme: dark)';

  readonly isDarkMode = signal(false);

  constructor() {
    this.initSystemThemeListener();
  }

  private initSystemThemeListener(): void {
    if (typeof window.matchMedia !== 'function') {
      this.applyTheme(false);
      return;
    }

    const mediaQuery = window.matchMedia(this.darkModeQuery);
    this.applyTheme(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent): void => {
      this.applyTheme(event.matches);
    };

    mediaQuery.addEventListener('change', listener);

    this.destroyRef.onDestroy(() => {
      mediaQuery.removeEventListener('change', listener);
    });
  }

  private applyTheme(isDarkMode: boolean): void {
    this.isDarkMode.set(isDarkMode);

    const root = this.document.documentElement;
    root.classList.toggle('dark-theme', isDarkMode);
    root.classList.toggle('light-theme', !isDarkMode);
  }
}
