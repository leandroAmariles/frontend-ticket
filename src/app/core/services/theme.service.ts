import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme_preference';
const DARK_CLASS = 'dark-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<AppTheme>(this.readInitialTheme());
  public readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  getTheme(): AppTheme {
    return this.themeSubject.value;
  }

  setTheme(theme: AppTheme): void {
    this.applyTheme(theme);
    this.themeSubject.next(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme still applies for this session
    }
  }

  toggle(): void {
    this.setTheme(this.themeSubject.value === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(theme: AppTheme): void {
    document.body.classList.toggle(DARK_CLASS, theme === 'dark');
  }

  private readInitialTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // ignore and fall back to system preference
    }
    const prefersDark = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
