/**
 * Integration tests for error handling and recovery flow
 *
 * T043: Error recovery and retry flow integration test
 * Tests error display, retry functionality, and state recovery
 * Coverage target: ≥85%
 */

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../core/services/auth.service';
import { TicketsApiService } from '../../services/tickets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('Error Recovery and Retry Flow Integration (T043)', () => {
  let authService: AuthService;
  let ticketsApiService: TicketsApiService;
  let errorHandlerService: ErrorHandlerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [AuthService, TicketsApiService, ErrorHandlerService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    authService = TestBed.inject(AuthService);
    ticketsApiService = TestBed.inject(TicketsApiService);
    errorHandlerService = TestBed.inject(ErrorHandlerService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should display error message when API request fails', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          // Verify error properties that would be displayed to user
          expect(error.message).toBeTruthy();
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should recover from error and display data on retry', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      // First attempt (fails)
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('first request should fail')),
        (error: any) => {
          expect(error.status).toBe(500);

          // Retry attempt (succeeds)
          ticketsApiService.getTickets().subscribe((response) => {
            expect(response.items.length).toBe(1);
            expect(response.items[0].titulo).toBe('Test Ticket');
            done();
          });

          // Mock retry request
          const retryReq = httpMock.expectOne(
            'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
          );
          retryReq.flush({
            items: [
              {
                id: '1',
                titulo: 'Test Ticket',
                descripcion: 'Recovered ticket',
                status: 'PENDING',
                creatorId: 'user',
                fecha: '2024-01-01',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            page: 0,
            size: 20,
            total: 1,
            totalPages: 1,
          });
        }
      );

      // Mock initial failed request
      const initialReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      initialReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle network timeout errors', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          expect(error.status).toBe(0);
          expect(error.message).toContain('Unable to connect');
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      req.error(new ErrorEvent('Network timeout'));
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle 403 Forbidden errors gracefully', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          expect(error.status).toBe(403);
          expect(error.message).toContain('permission');
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      req.flush({}, { status: 403, statusText: 'Forbidden' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle 400 Bad Request errors', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets(999, 999).subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          expect(error.status).toBe(400);
          expect(error.message).toContain('Invalid request');
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=999&size=999'
      );
      req.flush({}, { status: 400, statusText: 'Bad Request' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should retry with same parameters after error', (done) => {
    const page = 2;
    const size = 15;

    authService.login('user', 'pass').subscribe(() => {
      // First attempt with specific page/size
      ticketsApiService.getTickets(page, size).subscribe(
        () => done(new Error('should fail')),
        () => {
          // Retry with same page/size
          ticketsApiService.getTickets(page, size).subscribe((response) => {
            expect(response.items.length).toBe(1);
            done();
          });

          const retryReq = httpMock.expectOne(
            `http://localhost:8080/api/v1/tickets/all?page=${page}&size=${size}`
          );
          retryReq.flush({
            items: [
              {
                id: '1',
                titulo: 'Ticket',
                descripcion: 'Desc',
                status: 'PENDING',
                creatorId: 'uid',
                fecha: '2024-01-01',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            page,
            size,
            total: 1,
            totalPages: 1,
          });
        }
      );

      const initialReq = httpMock.expectOne(
        `http://localhost:8080/api/v1/tickets/all?page=${page}&size=${size}`
      );
      initialReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle malformed JSON response', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          expect(error.message).toContain('Invalid');
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      // Send invalid items structure
      req.flush({
        page: 0,
        size: 20,
        total: 0,
        totalPages: 0,
        // Missing items array
      });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle invalid ticket fields in response', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('should have errored')),
        (error: any) => {
          // Should fail validation due to missing required fields
          expect(error.message).toBeTruthy();
          done();
        }
      );

      const req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      req.flush({
        items: [
          {
            // Missing required fields: id, titulo, status, createdAt, updatedAt
            descripcion: 'No ID, no titulo',
          },
        ],
        page: 0,
        size: 20,
        total: 1,
        totalPages: 1,
      });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should allow multiple retries until success', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      let attemptCount = 0;

      const makeAttempt = () => {
        attemptCount++;
        ticketsApiService.getTickets().subscribe(
          (response) => {
            expect(attemptCount).toBe(3); // Should succeed on 3rd attempt
            expect(response.items.length).toBe(1);
            done();
          },
          (error) => {
            if (attemptCount < 3) {
              // Retry
              makeAttempt();
            } else {
              done(new Error('Should have succeeded by attempt 3'));
            }
          }
        );

        const req = httpMock.expectOne(
          'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
        );

        if (attemptCount < 3) {
          // Fail first two attempts
          req.flush({}, { status: 500, statusText: 'Internal Server Error' });
        } else {
          // Succeed on third attempt
          req.flush({
            items: [
              {
                id: '1',
                titulo: 'Success',
                descripcion: 'After retries',
                status: 'PENDING',
                creatorId: 'uid',
                fecha: '2024-01-01',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            page: 0,
            size: 20,
            total: 1,
            totalPages: 1,
          });
        }
      };

      makeAttempt();
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should clear error state between requests', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      // First request fails
      ticketsApiService.getTickets().subscribe(
        () => done(new Error('unexpected success')),
        () => {
          // Error received, now make second request
          ticketsApiService.getTickets(1, 20).subscribe((response) => {
            // Second request succeeds
            expect(response.items.length).toBe(0);
            done();
          });

          const secondReq = httpMock.expectOne(
            'http://localhost:8080/api/v1/tickets/all?page=1&size=20'
          );
          secondReq.flush({
            items: [],
            page: 1,
            size: 20,
            total: 0,
            totalPages: 0,
          });
        }
      );

      const firstReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      firstReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should maintain auth session during error recovery', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      const tokenBefore = authService.getToken();

      ticketsApiService.getTickets().subscribe(
        () => done(new Error('unexpected success')),
        () => {
          // Even after error, token should still be valid
          const tokenAfter = authService.getToken();
          expect(tokenAfter).toBe(tokenBefore);
          expect(tokenAfter).toBeTruthy();

          // Should be able to retry
          ticketsApiService.getTickets().subscribe(() => {
            done();
          });

          const retryReq = httpMock.expectOne(
            'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
          );
          retryReq.flush({
            items: [],
            page: 0,
            size: 20,
            total: 0,
            totalPages: 0,
          });
        }
      );

      const failReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      failReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });
});

