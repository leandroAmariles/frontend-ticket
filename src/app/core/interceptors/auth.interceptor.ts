import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from localStorage or auth service
    // For now, this is a placeholder that demonstrates the pattern
    const token = this.getToken();

    // Clone the request and add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }

  /**
   * Get authentication token
   * In a real application, this would come from an auth service
   */
  private getToken(): string | null {
    // Placeholder: retrieve token from localStorage, session, or auth service
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }
}

