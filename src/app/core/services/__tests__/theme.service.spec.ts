import { ThemeService } from '../theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  it('defaults to light theme when nothing is stored and system preference is light', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as any;

    const service = new ThemeService();

    expect(service.getTheme()).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });

  it('reads a previously stored preference instead of the system default', () => {
    localStorage.setItem('theme_preference', 'dark');
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as any;

    const service = new ThemeService();

    expect(service.getTheme()).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
  });

  it('toggle() switches the theme, applies the class, and persists the choice', () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as any;
    const service = new ThemeService();

    service.toggle();

    expect(service.getTheme()).toBe('dark');
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    expect(localStorage.getItem('theme_preference')).toBe('dark');

    service.toggle();

    expect(service.getTheme()).toBe('light');
    expect(document.body.classList.contains('dark-theme')).toBe(false);
    expect(localStorage.getItem('theme_preference')).toBe('light');
  });

  it('emits the current theme on theme$', (done) => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as any;
    const service = new ThemeService();

    service.theme$.subscribe((theme) => {
      expect(theme).toBe('light');
      done();
    });
  });
});
