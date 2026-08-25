/**
 * Unit tests for AuthInterceptor
 * Tests token injection, 401 handling, and request pass-through
 *
 * T017: AuthInterceptor unit tests
 * Coverage target: ≥85%
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthInterceptor } from '../auth.interceptor';
import { AuthService } from '../../services/auth.service';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: { getToken: jest.Mock; clearToken: jest.Mock };
  let router: { navigate: jest.Mock; url: string };

  beforeEach(() => {
    authService = {
      getToken: jest.fn().mockReturnValue(null),
      clearToken: jest.fn(),
    };
    router = {
      navigate: jest.fn(),
      url: '/tickets',
    };

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Authorization Header Injection', () => {
    it('should inject Authorization header when token exists', (done) => {
      const token = 'test-jwt-token-12345';
      authService.getToken.mockReturnValue(token);

      httpClient.get('/api/v1/tickets/all').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/v1/tickets/all');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush({ items: [] });
    });

    it('should not inject Authorization header when token is null', (done) => {
      authService.getToken.mockReturnValue(null);

      httpClient.get('/api/test').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should format token correctly with Bearer scheme', (done) => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      authService.getToken.mockReturnValue(token);

      httpClient.get('/api/v1/tickets/all').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/v1/tickets/all');
      const authHeader = req.request.headers.get('Authorization');
      expect(authHeader).toMatch(/^Bearer /);
      expect(authHeader).toBe(`Bearer ${token}`);
      req.flush({ items: [] });
    });

    it('should allow requests without Authentication to pass through', (done) => {
      httpClient.get('/api/health').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/health');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('401 Unauthorized Response Handling', () => {
    it('should clear token on 401 response', (done) => {
      const token = 'expired-token';
      authService.getToken.mockReturnValue(token);

      httpClient.get('/api/v1/tickets/all').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(authService.clearToken).toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/tickets/all');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should redirect to login on 401 response', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/v1/tickets/all').subscribe({
        next: () => done(new Error('should have errored')),
        error: () => {
          expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: { returnUrl: '/tickets' },
          });
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/tickets/all');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should pass through 401 error after handling', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.error?.message).toBe('Unauthorized');
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should include returnUrl parameter when redirecting to login', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/admin/config').subscribe({
        next: () => done(new Error('should have errored')),
        error: () => {
          expect(router.navigate).toHaveBeenCalled();
          const args = router.navigate.mock.calls[router.navigate.mock.calls.length - 1];
          expect(args[0]).toEqual(['/login']);
          expect(args[1].queryParams.returnUrl).toBe('/tickets');
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin/config');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Error Pass-Through', () => {
    it('should pass through 400 Bad Request errors', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(authService.clearToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({ error: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should pass through 403 Forbidden errors', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/admin').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(authService.clearToken).not.toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne('/api/admin');
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });

    it('should pass through 500 Server Error responses', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(authService.clearToken).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should pass through 503 Service Unavailable errors', (done) => {
      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 503, statusText: 'Service Unavailable' });
    });
  });

  describe('Request Pass-Through', () => {
    it('should pass through successful GET requests', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/v1/tickets/all').subscribe((response) => {
        expect(response).toEqual({ items: [] });
        done();
      });

      const req = httpMock.expectOne('/api/v1/tickets/all');
      req.flush({ items: [] });
    });

    it('should pass through successful POST requests', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient.post('/api/v1/tickets', { titulo: 'Test' }).subscribe((response) => {
        expect(response).toEqual({ id: '1', titulo: 'Test' });
        done();
      });

      const req = httpMock.expectOne('/api/v1/tickets');
      req.flush({ id: '1', titulo: 'Test' });
    });

    it('should preserve request body for POST requests', (done) => {
      authService.getToken.mockReturnValue('token');
      const payload = { titulo: 'New Ticket', descripcion: 'Description' };

      httpClient.post('/api/v1/tickets', payload).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/v1/tickets');
      expect(req.request.body).toEqual(payload);
      req.flush({});
    });

    it('should preserve other headers in request', (done) => {
      authService.getToken.mockReturnValue('token');

      httpClient
        .get('/api/test', {
          headers: { 'X-Custom-Header': 'custom-value' },
        })
        .subscribe(() => {
          done();
        });

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      expect(req.request.headers.has('Authorization')).toBe(true);
      req.flush({});
    });
  });

  describe('Token Refresh and Edge Cases', () => {
    it('should handle multiple consecutive requests with same token', (done) => {
      const token = 'same-token';
      authService.getToken.mockReturnValue(token);

      httpClient.get('/api/request1').subscribe(() => {
        httpClient.get('/api/request2').subscribe(() => {
          done();
        });

        const req2 = httpMock.expectOne('/api/request2');
        req2.flush({});
      });

      const req1 = httpMock.expectOne('/api/request1');
      req1.flush({});
    });

    it('should handle token changes between requests', (done) => {
      const token1 = 'token-1';
      authService.getToken.mockReturnValue(token1);

      httpClient.get('/api/request1').subscribe(() => {
        const token2 = 'token-2';
        authService.getToken.mockReturnValue(token2);

        httpClient.get('/api/request2').subscribe(() => {
          done();
        });

        const req2 = httpMock.expectOne('/api/request2');
        expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${token2}`);
        req2.flush({});
      });

      const req1 = httpMock.expectOne('/api/request1');
      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${token1}`);
      req1.flush({});
    });

    it('should handle empty token string', (done) => {
      authService.getToken.mockReturnValue('');

      httpClient.get('/api/test').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('/api/test');
      // An empty string is falsy, so the interceptor does not add the header at all.
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should proceed with request even if clearToken throws', (done) => {
      authService.getToken.mockReturnValue('token');
      authService.clearToken.mockImplementation(() => {
        throw new Error('Clear token failed');
      });

      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Logging and Debugging', () => {
    it('should log 401 errors for debugging', (done) => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      authService.getToken.mockReturnValue('token');

      httpClient.get('/api/test').subscribe({
        next: () => done(new Error('should have errored')),
        error: () => {
          expect(warnSpy).toHaveBeenCalledWith('Session expired. Please login again.');
          done();
        },
      });

      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
