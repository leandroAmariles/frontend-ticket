/**
 * Unit tests for TicketsApiService
 * Tests API method validations, parameter handling, and error scenarios
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TicketsApiService } from '../../services/tickets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { TicketsResponse, CreateTicketPayload } from '../../models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const TICKETS_ALL_URL = 'http://localhost:8080/api/v1/tickets/all';
const CREATE_URL = 'http://localhost:8080/api/tickets';

describe('TicketsApiService', () => {
  let service: TicketsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [TicketsApiService, ErrorHandlerService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(TicketsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTickets', () => {
    it('should fetch tickets with default parameters (page=0, size=20)', (done) => {
      service.getTickets().subscribe((response: TicketsResponse) => {
        expect(response.items).toBeDefined();
        expect(response.total).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${TICKETS_ALL_URL}?page=0&size=20`);
      expect(req.request.method).toBe('GET');

      req.flush({ items: [], page: 0, size: 20, total: 0, totalPages: 0 });
    });

    it('should fetch tickets with the given page and size parameters', (done) => {
      service.getTickets(2, 50).subscribe(() => done());

      const req = httpMock.expectOne(
        (request) =>
          request.url === TICKETS_ALL_URL &&
          request.params.get('page') === '2' &&
          request.params.get('size') === '50'
      );

      expect(req.request.method).toBe('GET');
      req.flush({ items: [], page: 2, size: 50, total: 0, totalPages: 0 });
    });

    it('should map the API response correctly, including optional fields', (done) => {
      service.getTickets().subscribe((response: TicketsResponse) => {
        expect(response.items[0].id).toBe('123');
        expect(response.items[0].titulo).toBe('Test Ticket');
        expect(response.items[0].severity).toBe('high');
        expect(response.total).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${TICKETS_ALL_URL}?page=0&size=20`);

      req.flush({
        items: [
          {
            id: '123',
            titulo: 'Test Ticket',
            descripcion: 'Description',
            status: 'PENDING',
            creatorId: null,
            fecha: '2026-04-25T10:15:30Z',
            createdAt: '2026-04-25T10:15:30Z',
            severity: 'high',
          },
        ],
        page: 0,
        size: 20,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe('createTicket', () => {
    it('should POST the payload and return the accepted response', (done) => {
      const payload: CreateTicketPayload = {
        fecha: '2026-04-25T10:15:30Z',
        titulo: 'New Ticket',
        descripcion: 'Description',
      };

      service.createTicket(payload).subscribe((response) => {
        expect(response.messageId).toBe('new-ticket-id');
        expect(response.status).toBe('ACCEPTED');
        done();
      });

      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush(
        { messageId: 'new-ticket-id', status: 'ACCEPTED', timestamp: Date.now() },
        { status: 202, statusText: 'Accepted' }
      );
    });

    it('should send exactly the payload fields (fecha, titulo, descripcion)', (done) => {
      const payload: CreateTicketPayload = {
        fecha: '2026-04-25T10:15:30Z',
        titulo: 'Test',
        descripcion: 'Test Description',
      };

      service.createTicket(payload).subscribe(() => done());

      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.body).toEqual(payload);

      req.flush(
        { messageId: 'id', status: 'ACCEPTED', timestamp: Date.now() },
        { status: 202, statusText: 'Accepted' }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 validation error on getTickets', (done) => {
      service.getTickets().subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${TICKETS_ALL_URL}?page=0&size=20`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 unauthorized error on getTickets', (done) => {
      service.getTickets().subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(`${TICKETS_ALL_URL}?page=0&size=20`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 500 server error on createTicket', (done) => {
      service
        .createTicket({ fecha: '2026-04-25T10:15:30Z', titulo: 'Test', descripcion: 'Test' })
        .subscribe({
          next: () => done(new Error('should not succeed')),
          error: (error) => {
            expect(error.status).toBe(500);
            done();
          },
        });

      const req = httpMock.expectOne(CREATE_URL);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should reject a malformed response missing the items array', (done) => {
      service.getTickets().subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.message).toContain('Invalid');
          done();
        },
      });

      const req = httpMock.expectOne(`${TICKETS_ALL_URL}?page=0&size=20`);
      req.flush({ page: 0, size: 20, total: 0, totalPages: 0 });
    });
  });
});
