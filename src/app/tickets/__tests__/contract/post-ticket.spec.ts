/**
 * Contract tests for POST /tickets endpoint
 * Validates the API contract for creating tickets
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { TicketsApiService } from '../../services/tickets-api.service';
import { CreateTicketPayload, Ticket } from '../../models';

describe('POST /tickets - Contract Tests', () => {
  let service: TicketsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TicketsApiService],
    });

    service = TestBed.inject(TicketsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('API Contract: POST /tickets', () => {
    it('should create a ticket and return the created ticket', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'high',
        status: 'open',
      };

      service.createTicket(payload).subscribe((response: Ticket) => {
        // Validate response structure per contracts/tickets-api.md
        expect(response.id).toBeDefined();
        expect(response.title).toBe('Test Ticket');
        expect(response.created_at).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      const mockResponse: Ticket = {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      req.flush(mockResponse, { status: 201, statusText: 'Created' });
    });

    it('should include all fields in the response', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Full Test',
        description: 'Full Description',
        priority: 'medium',
        status: 'in_progress',
        assigned_to_id: 'user-123',
        assigned_to_name: 'John Doe',
      };

      service.createTicket(payload).subscribe((response: Ticket) => {
        expect(response.assigned_to_id).toBe('user-123');
        expect(response.assigned_to_name).toBe('John Doe');
        expect(response.priority).toBe('medium');
        expect(response.status).toBe('in_progress');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);

      const mockResponse: Ticket = {
        id: '123',
        ...payload,
        created_at: '2026-04-25T10:15:30Z',
      };

      req.flush(mockResponse, { status: 201, statusText: 'Created' });
    });

    it('should handle response with null assigned_to fields', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Unassigned Ticket',
        description: 'No assignee',
        priority: 'low',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
      };

      service.createTicket(payload).subscribe((response: Ticket) => {
        expect(response.assigned_to_id).toBeNull();
        expect(response.assigned_to_name).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);

      const mockResponse: Ticket = {
        id: '123',
        title: 'Unassigned Ticket',
        description: 'No assignee',
        priority: 'low',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      req.flush(mockResponse, { status: 201, statusText: 'Created' });
    });
  });

  describe('Error Handling for POST /tickets', () => {
    it('should handle 400 validation error', (done) => {
      const payload: CreateTicketPayload = {
        title: '',
        description: 'Invalid',
        priority: 'invalid' as any,
        status: 'open',
      };

      service.createTicket(payload).subscribe(
        () => {
          fail('should not succeed');
        },
        (error) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush({ message: 'Validation error' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 unauthorized error', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test',
        description: 'Test',
        priority: 'high',
        status: 'open',
      };

      service.createTicket(payload).subscribe(
        () => {
          fail('should not succeed');
        },
        (error) => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden error (no permission)', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test',
        description: 'Test',
        priority: 'high',
        status: 'open',
      };

      service.createTicket(payload).subscribe(
        () => {
          fail('should not succeed');
        },
        (error) => {
          expect(error.status).toBe(403);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 500 server error', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test',
        description: 'Test',
        priority: 'high',
        status: 'open',
      };

      service.createTicket(payload).subscribe(
        () => {
          fail('should not succeed');
        },
        (error) => {
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});

