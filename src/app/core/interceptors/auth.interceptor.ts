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
 * **Purpose**: This HTTP interceptor is the middleware that:
 * 1. Intercepts every outgoing HTTP request in the application
 * 2. Checks if a valid token exists in AuthService
 * 3. If token exists → adds `Authorization: Bearer <token>` header
 * 4. If token missing/expired → allows request without header (for login endpoint)
 * 5. Catches 401 responses → clears token and redirects to login
 * 6. Passes all other responses through normally
 *
 * **How HTTP Interceptors Work**:
 * Angular's HTTP client uses a chain of interceptors:
 * ```
 * HttpClient Request
 *   ↓
 * AuthInterceptor (this one)
 *   ↓
 * Other Interceptors
 *   ↓
 * Backend
 *   ↓
 * Response
 *   ↓
 * Other Interceptors (in reverse)
 *   ↓
 * AuthInterceptor (error handling)
 *   ↓
 * Component
 * ```
 *
 * **Token Injection Process**:
 * 1. getToken() called on every request (checks localStorage)
 * 2. If token exists: clone request, add header
 * 3. If token null: pass request unchanged
 * 4. Request sent to backend
 * 5. Backend validates `Authorization` header
 * 6. If valid: return 200 with data
 * 7. If invalid/expired: return 401
 *
 * **401 Handling (Session Expired)**:
 * When backend returns 401:
 * 1. Interceptor catches the error
 * 2. Calls authService.clearToken() (removes from localStorage)
 * 3. Calls router.navigate(['/login'], {queryParams: {returnUrl}})
 * 4. User sees login page
 * 5. After login, returnUrl can be used to redirect back
 *
 * **Why This Pattern**:
 * - Centralized token injection (don't need to add header in every component)
 * - Automatic 401 handling (don't need error checking in every API call)
 * - DRY principle (Don't Repeat Yourself)
 * - Cleaner component code (services just call API, no token logic)
 *
 * **Request Flow Example**:
 * ```
 * Component calls: this.http.get('/api/v1/tickets/all')
 *   ↓
 * Interceptor intercept() method called
 *   ↓
 * token = authService.getToken() // "jwt-token-xyz"
 *   ↓
 * Clone request and add header: { Authorization: 'Bearer jwt-token-xyz' }
 *   ↓
 * next.handle(request) // Send modified request
 *   ↓
 * Backend receives request with Authorization header
 *   ↓
 * Backend validates token and returns 200 + data
 *   ↓
 * Interceptor receives response
 *   ↓
 * No errors, pass through via pipe
 *   ↓
 * Component receives data
 * ```
 *
 * **Error Flow Example**:
 * ```
 * Component calls: this.http.get('/api/v1/tickets/all')
 *   ↓
 * Token added to request
 *   ↓
 * Backend returns 401 (token expired)
 *   ↓
 * Interceptor catches error in catchError()
 *   ↓
 * Detect status === 401
 *   ↓
 * Clear token: authService.clearToken()
 *   ↓
 * Log message: 'Session expired. Please login again.'
 *   ↓
 * Redirect: router.navigate(['/login'], {queryParams: {returnUrl: '/tickets'}})
 *   ↓
 * User sees login page, can login again
 *   ↓
 * App automatically redirects back to /tickets after login
 * ```
 *
 * **Limitations & Future Enhancements**:
 * Current implementation:
 * - ✅ Token injection on all requests
 * - ✅ 401 handling
 * - ❌ Token refresh (refresh tokens not implemented yet)
 * - ❌ Retry failed requests (would need retry interceptor)
 * - ❌ Request timeout handling
 *
 * Future:
 * - Implement refresh token flow (get new token when expiring)
 * - Add retry logic (exponential backoff)
 * - Add timeout handling for slow networks
 * - Add request/response logging for debugging
 *
 * @service HTTP Interceptor (registered in app.module.ts)
 * @implements HttpInterceptor
 * @see AuthService for token management
 * @see app.module.ts for provider registration
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
        // Handle 401 Unauthorized responses — but NOT for the login endpoint itself
        // (login failures should be handled by the login component, not redirected)
        const isLoginEndpoint = request.url.includes('/api/auth/login');
        if (error.status === 401 && !isLoginEndpoint) {
          // Clear the expired token
          this.authService.clearToken();

          // Display user-friendly message
          console.warn('Session expired. Please login again.');

          // Redirect to login page, but never with returnUrl=/login to avoid loops
          const currentUrl = this.router.url.split('?')[0]; // strip existing query params
          const returnUrl = currentUrl === '/login' ? '/tickets' : currentUrl;
          this.router.navigate(['/login'], {
            queryParams: { returnUrl }
          });
        }

        // Pass the error through for other handlers
        return throwError(() => error);
      })
    );
  }
}

