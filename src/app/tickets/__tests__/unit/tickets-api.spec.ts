/**
 * Unit tests for TicketsApiService
 * Tests API method validations, parameter handling, and error scenarios
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { TicketsApiService } from '../../services/tickets-api.service';
import { TicketsListResponse, CreateTicketPayload } from '../../models';

describe('TicketsApiService', () => {
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

  describe('listTickets', () => {
    it('should fetch tickets with default parameters', (done) => {
      service.listTickets().subscribe((response: TicketsListResponse) => {
        expect(response.data).toBeDefined();
        expect(response.meta).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      expect(req.request.method).toBe('GET');

      req.flush({
        data: [],
        meta: { total: 0, page: 1, page_size: 25, total_pages: 0 },
      });
    });

    it('should fetch tickets with pagination parameters', (done) => {
      service.listTickets({ page: 2, page_size: 50 }).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${environment.apiBaseUrl}/tickets`) &&
          request.params.get('page') === '2' &&
          request.params.get('page_size') === '50'
      );

      expect(req.request.method).toBe('GET');
      req.flush({
        data: [],
        meta: { total: 0, page: 2, page_size: 50, total_pages: 0 },
      });
    });

    it('should fetch with filters', (done) => {
      service
        .listTickets({
          priority: 'high',
          status: 'open',
        })
        .subscribe(() => {
          done();
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${environment.apiBaseUrl}/tickets`) &&
          request.params.get('priority') === 'high' &&
          request.params.get('status') === 'open'
      );

      expect(req.request.method).toBe('GET');
      req.flush({
        data: [],
        meta: { total: 0, page: 1, page_size: 25, total_pages: 0 },
      });
    });

    it('should fetch with sorting', (done) => {
      service
        .listTickets({
          sort: 'priority:asc',
        })
        .subscribe(() => {
          done();
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${environment.apiBaseUrl}/tickets`) &&
          request.params.get('sort') === 'priority:asc'
      );

      expect(req.request.method).toBe('GET');
      req.flush({
        data: [],
        meta: { total: 0, page: 1, page_size: 25, total_pages: 0 },
      });
    });

    it('should map API response correctly', (done) => {
      service.listTickets().subscribe((response: TicketsListResponse) => {
        expect(response.data[0].id).toBe('123');
        expect(response.data[0].title).toBe('Test Ticket');
        expect(response.meta.total).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);

      req.flush({
        data: [
          {
            id: '123',
            title: 'Test Ticket',
            description: 'Description',
            priority: 'high',
            status: 'open',
            assigned_to_id: null,
            assigned_to_name: null,
            created_at: '2026-04-25T10:15:30Z',
          },
        ],
        meta: { total: 1, page: 1, page_size: 25, total_pages: 1 },
      });
    });
  });

  describe('createTicket', () => {
    it('should create a new ticket', (done) => {
      const payload: CreateTicketPayload = {
        title: 'New Ticket',
        description: 'Description',
        priority: 'medium',
        status: 'open',
      };

      service.createTicket(payload).subscribe((response) => {
        expect(response.id).toBe('new-ticket-id');
        expect(response.title).toBe('New Ticket');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);

      req.flush({
        id: 'new-ticket-id',
        title: 'New Ticket',
        description: 'Description',
        priority: 'medium',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      });
    });

    it('should include all payload fields', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test',
        description: 'Test Description',
        priority: 'high',
        status: 'in_progress',
        assigned_to_id: 'user-123',
        assigned_to_name: 'John Doe',
      };

      service.createTicket(payload).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      expect(req.request.body).toEqual(payload);

      req.flush({
        id: 'new-id',
        ...payload,
        created_at: '2026-04-25T10:15:30Z',
      });
    });

    it('should handle creation with null assignee', (done) => {
      const payload: CreateTicketPayload = {
        title: 'Test',
        description: 'Test',
        priority: 'low',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
      };

      service.createTicket(payload).subscribe((response) => {
        expect(response.assigned_to_id).toBeNull();
        expect(response.assigned_to_name).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush({
        id: 'new-id',
        ...payload,
        created_at: '2026-04-25T10:15:30Z',
      });
    });
  });

  describe('getTicketById', () => {
    it('should fetch a ticket by ID', (done) => {
      service.getTicketById('ticket-123').subscribe((response) => {
        expect(response.id).toBe('ticket-123');
        done();
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets/ticket-123`);
      expect(req.request.method).toBe('GET');

      req.flush({
        id: 'ticket-123',
        title: 'Test',
        description: 'Test',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 validation error', (done) => {
      service.listTickets().subscribe(
        () => {
          fail('should not succeed');
        },
        (error) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/tickets`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 unauthorized error', (done) => {
      service.listTickets().subscribe(
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

    it('should handle 500 server error', (done) => {
      service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: 'high',
        status: 'open',
      }).subscribe(
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

