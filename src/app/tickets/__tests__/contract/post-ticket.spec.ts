/**
 * Contract tests for POST /api/tickets
 * Validates the real backend contract: payload is { fecha, titulo, descripcion },
 * response is 202 Accepted with { messageId, status, timestamp } (see
 * TicketsApiService.createTicket and models/index.ts).
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TicketsApiService } from '../../services/tickets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CreateTicketPayload, CreateTicketResponse } from '../../models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const CREATE_URL = 'http://localhost:8080/api/tickets';

describe('POST /api/tickets - Contract Tests', () => {
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

  describe('API Contract: POST /api/tickets', () => {
    it('should accept the ticket and return a 202 with messageId/status/timestamp', (done) => {
      const payload: CreateTicketPayload = {
        fecha: '2026-04-25T10:15:30Z',
        titulo: 'Test Ticket',
        descripcion: 'Test Description',
      };

      service.createTicket(payload).subscribe((response: CreateTicketResponse) => {
        expect(response.messageId).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.timestamp).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      const mockResponse: CreateTicketResponse = {
        messageId: 'a1b2c3d4-0000-0000-0000-000000000000',
        status: 'ACCEPTED',
        timestamp: Date.now(),
      };

      req.flush(mockResponse, { status: 202, statusText: 'Accepted' });
    });

    it('should send exactly fecha, titulo and descripcion in the request body', (done) => {
      const payload: CreateTicketPayload = {
        fecha: '2026-04-25T10:15:30Z',
        titulo: 'Full Test',
        descripcion: 'Full Description',
      };

      service.createTicket(payload).subscribe(() => done());

      const req = httpMock.expectOne(CREATE_URL);
      expect(req.request.body).toEqual({
        fecha: payload.fecha,
        titulo: payload.titulo,
        descripcion: payload.descripcion,
      });

      req.flush(
        { messageId: 'id-1', status: 'ACCEPTED', timestamp: Date.now() },
        { status: 202, statusText: 'Accepted' }
      );
    });
  });

  describe('Error Handling for POST /api/tickets', () => {
    const payload: CreateTicketPayload = {
      fecha: '2026-04-25T10:15:30Z',
      titulo: 'Test',
      descripcion: 'Test',
    };

    it('should handle 400 validation error', (done) => {
      service.createTicket(payload).subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(CREATE_URL);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 unauthorized error', (done) => {
      service.createTicket(payload).subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne(CREATE_URL);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden error (no permission)', (done) => {
      service.createTicket(payload).subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(403);
          done();
        },
      });

      const req = httpMock.expectOne(CREATE_URL);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 500 server error', (done) => {
      service.createTicket(payload).subscribe({
        next: () => done(new Error('should not succeed')),
        error: (error) => {
          expect(error.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(CREATE_URL);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
