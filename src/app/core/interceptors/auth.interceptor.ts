import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authentication Interceptor
 * Automatically injects Authorization header with Bearer token to all HTTP requests
 * Handles 401 Unauthorized responses by clearing token and redirecting to login
 *
 * Responsibilities:
 * - Inject Authorization: Bearer <token> header to all outgoing requests
 * - Catch 401 responses and trigger logout/redirect to login
 * - Handle token expiration gracefully
 * - Allow pass-through for requests that don't need tokens
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the current authentication token
    const token = this.authService.getToken();

    // Clone the request and add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Handle response and potential errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          // Clear the expired token
          this.authService.clearToken();

          // Display user-friendly message
          console.warn('Session expired. Please login again.');

          // Redirect to login page
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }

        // Pass the error through for other handlers
        return throwError(() => error);
      })
    );
  }
}

