import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService, AppTheme } from './core/services/theme.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'Tickets Dashboard';

  theme$ = this.themeService.theme$;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isTokenValid();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get username(): string | null {
    return this.authService.getUsername();
  }

  isDark(theme: AppTheme | null): boolean {
    return theme === 'dark';
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
