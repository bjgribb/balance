import { Component, signal } from '@angular/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';

type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonToggleModule, MatCardModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly themeStorageKey = 'theme-mode';

  protected readonly title = signal('Balance');
  protected readonly themeMode = signal<ThemeMode>('system');

  constructor() {
    const savedMode = localStorage.getItem(this.themeStorageKey);
    if (this.isThemeMode(savedMode)) {
      this.themeMode.set(savedMode);
    }

    this.applyTheme(this.themeMode());
  }

  protected onThemeChange(event: MatButtonToggleChange): void {
    const nextMode = event.value;
    if (!this.isThemeMode(nextMode)) {
      return;
    }

    this.themeMode.set(nextMode);
    localStorage.setItem(this.themeStorageKey, nextMode);
    this.applyTheme(nextMode);
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

  private isThemeMode(value: string | null): value is ThemeMode {
    return value === 'system' || value === 'light' || value === 'dark';
  }
}
