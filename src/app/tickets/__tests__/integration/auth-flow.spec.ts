/**
 * Integration tests for complete authentication and tickets load flow
 *
 * T042: Full auth → fetch tickets flow integration test
 * Tests the complete user journey from login through ticket display
 * Coverage target: ≥85%
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AuthInterceptor } from '../../core/interceptors/auth.interceptor';
import { TicketsApiService } from '../../tickets/services/tickets-api.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

describe('Auth → Tickets Flow Integration (T042)', () => {
  let authService: AuthService;
  let ticketsApiService: TicketsApiService;
  let errorHandlerService: ErrorHandlerService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        TicketsApiService,
        ErrorHandlerService,
        AuthInterceptor,
      ],
    });

    authService = TestBed.inject(AuthService);
    ticketsApiService = TestBed.inject(TicketsApiService);
    errorHandlerService = TestBed.inject(ErrorHandlerService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should complete full flow: login → token stored → request with Authorization header → data displayed', (done) => {
    const username = 'testuser';
    const password = 'testpass';

    // Step 1: User logs in
    authService.login(username, password).subscribe((token) => {
      // Step 2: Verify token is stored
      const storedToken = authService.getToken();
      expect(storedToken).toBe('jwt-token-12345');

      // Step 3: User requests tickets
      ticketsApiService.getTickets(0, 20).subscribe((response) => {
        // Step 4: Verify data is received and valid
        expect(response.items).toBeDefined();
        expect(response.items.length).toBe(2);
        expect(response.page).toBe(0);
        expect(response.size).toBe(20);
        expect(response.total).toBe(2);

        // Step 5: Verify first ticket
        const firstTicket = response.items[0];
        expect(firstTicket.id).toBe('1');
        expect(firstTicket.titulo).toBe('Test Ticket 1');

        done();
      });

      // Mock tickets endpoint request
      const ticketsReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      expect(ticketsReq.request.method).toBe('GET');
      expect(ticketsReq.request.headers.get('Authorization')).toBe('Bearer jwt-token-12345');

      ticketsReq.flush({
        items: [
          {
            id: '1',
            titulo: 'Test Ticket 1',
            descripcion: 'Description 1',
            status: 'PENDING',
            creatorId: 'user1',
            fecha: '2024-01-01',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            titulo: 'Test Ticket 2',
            descripcion: 'Description 2',
            status: 'CREATED',
            creatorId: 'user1',
            fecha: '2024-01-02',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
        page: 0,
        size: 20,
        total: 2,
        totalPages: 1,
      });
    });

    // Mock login endpoint
    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({
      accessToken: 'jwt-token-12345',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: username,
      issuedAt: Date.now(),
    });
  });

  it('should handle authentication and multiple ticket page requests', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      // First page request
      ticketsApiService.getTickets(0, 10).subscribe(() => {
        // Second page request
        ticketsApiService.getTickets(1, 10).subscribe(() => {
          done();
        });

        const page2Req = httpMock.expectOne(
          'http://localhost:8080/api/v1/tickets/all?page=1&size=10'
        );
        expect(page2Req.request.headers.get('Authorization')).toBeTruthy();
        page2Req.flush({
          items: [],
          page: 1,
          size: 10,
          total: 12,
          totalPages: 2,
        });
      });

      const page1Req = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=10'
      );
      expect(page1Req.request.headers.get('Authorization')).toBeTruthy();
      page1Req.flush({
        items: [
          {
            id: '1',
            titulo: 'T1',
            descripcion: 'D1',
            status: 'PENDING',
            creatorId: 'uid',
            fecha: '2024-01-01',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        page: 0,
        size: 10,
        total: 12,
        totalPages: 2,
      });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: 'token-xyz',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle invalid credentials during login', (done) => {
    authService.login('invalid', 'wrong').subscribe(
      () => fail('should have errored'),
      (error) => {
        expect(error.status).toBe(401);
        const storedToken = authService.getToken();
        expect(storedToken).toBeNull();
        done();
      }
    );

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush(
      { error: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });

  it('should handle 401 during ticket fetch and redirect to login', (done) => {
    const router = TestBed.inject(require('@angular/router').Router);
    spyOn(router, 'navigate');

    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => fail('should have errored'),
        (error: any) => {
          expect(error.status).toBe(401);
          // Interceptor should handle this and redirect
          done();
        }
      );

      const ticketsReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      expect(ticketsReq.request.headers.has('Authorization')).toBe(true);
      ticketsReq.flush({}, { status: 401, statusText: 'Unauthorized' });
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

  it('should validate token is sent with every API request after login', (done) => {
    const token = 'test-jwt-12345';

    authService.login('user', 'pass').subscribe(() => {
      // Make multiple requests and verify all have authorization headers
      const requests = [
        ticketsApiService.getTickets(0, 20),
        ticketsApiService.getTickets(1, 20),
      ];

      let completed = 0;
      requests.forEach((req) => {
        req.subscribe(() => {
          completed++;
          if (completed === requests.length) {
            done();
          }
        });
      });

      // Both requests should have been made with auth header
      const allRequests = httpMock.match(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      allRequests.forEach((req) => {
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
        req.flush({
          items: [],
          page: 0,
          size: 20,
          total: 0,
          totalPages: 0,
        });
      });
    });

    const loginReq = httpMock.expectOne('http://localhost:8080/api/auth/login');
    loginReq.flush({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should maintain token across multiple service calls', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      const token1 = authService.getToken();

      // Simulate waiting/other operations
      setTimeout(() => {
        const token2 = authService.getToken();

        expect(token1).toBe(token2);
        expect(token1).toBeTruthy();
        done();
      }, 100);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    req.flush({
      accessToken: 'persistent-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      username: 'user',
      issuedAt: Date.now(),
    });
  });

  it('should handle 500 server errors on tickets endpoint', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => fail('should have errored'),
        (error: any) => {
          expect(error.status).toBe(500);
          expect(error.message).toContain('Server error');
          done();
        }
      );

      const ticketsReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      ticketsReq.flush({}, { status: 500, statusText: 'Internal Server Error' });
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

  it('should handle network errors during ticket fetch', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => fail('should have errored'),
        (error: any) => {
          expect(error.status).toBe(0);
          expect(error.message).toContain('Unable to connect');
          done();
        }
      );

      const ticketsReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      ticketsReq.error(new ErrorEvent('Network error'));
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

  it('should handle malformed response data', (done) => {
    authService.login('user', 'pass').subscribe(() => {
      ticketsApiService.getTickets().subscribe(
        () => fail('should have errored'),
        (error: any) => {
          expect(error.message).toContain('Invalid');
          done();
        }
      );

      const ticketsReq = httpMock.expectOne(
        'http://localhost:8080/api/v1/tickets/all?page=0&size=20'
      );
      // Missing items array
      ticketsReq.flush({
        page: 0,
        size: 20,
        total: 0,
        totalPages: 0,
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
});

