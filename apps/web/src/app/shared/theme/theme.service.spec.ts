import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;
  let listeners: ((event: MediaQueryListEvent) => void)[];
  let isDarkMode: boolean;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    listeners = [];
    isDarkMode = false;

    window.matchMedia = ((query: string): MediaQueryList => {
      return {
        matches: isDarkMode,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
          listeners.push(listener as (event: MediaQueryListEvent) => void);
        },
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
          listeners = listeners.filter(
            (registered) => registered !== (listener as (event: MediaQueryListEvent) => void),
          );
        },
        addListener: (listener: (event: MediaQueryListEvent) => void) => {
          listeners.push(listener);
        },
        removeListener: (listener: (event: MediaQueryListEvent) => void) => {
          listeners = listeners.filter((registered) => registered !== listener);
        },
        dispatchEvent: (event: Event): boolean => {
          void event;
          return true;
        },
      };
    }) as typeof window.matchMedia;

    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    }

    document.documentElement.classList.remove('light-theme', 'dark-theme');
  });

  it('applies light theme when system is not dark', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.isDarkMode()).toBe(false);
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });

  it('updates theme when system preference changes', () => {
    const service = TestBed.inject(ThemeService);

    isDarkMode = true;
    listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));

    expect(service.isDarkMode()).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });
});
