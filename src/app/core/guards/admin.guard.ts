import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Restricts a route to users whose JWT carries the ADMIN role.
 * This is a frontend-only gate: the backend-ia Knowledge Base API this
 * protects does not enforce roles itself, so this guard is the only
 * access control in place — see specs/ for the accepted trade-off.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate(['/tickets']);
    return false;
  }
}
