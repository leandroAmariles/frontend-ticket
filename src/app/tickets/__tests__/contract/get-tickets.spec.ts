/**
 * Contract tests for GET /tickets endpoint
 * Validates the API contract as defined in contracts/tickets-api.md
 */

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { TicketsApiService } from '../../services/tickets-api.service';
import { TicketsListResponse } from '../../models';

describe('GET /tickets - Contract Tests', () => {
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

  describe('API Contract: GET /tickets', () => {
    it('should return response with data array and meta object', (done) => {
      service.listTickets({ page: 1, page_size: 25 }).subscribe((response: TicketsListResponse) => {
        // Validate response structure
        expect(response).toHaveProperty('data');
        expect(response).toHaveProperty('meta');
        expect(Array.isArray(response.data)).toBe(true);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/tickets?page=1&page_size=25`
      );
      expect(req.request.method).toBe('GET');

      // Mock response per contracts/tickets-api.md
      const mockResponse: TicketsListResponse = {
        data: [
          {
            id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            title: 'No puedo iniciar sesión',
            description: 'El usuario reporta error 500 al iniciar sesión',
            priority: 'high',
            status: 'open',
            assigned_to_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            assigned_to_name: 'María Pérez',
            created_at: '2026-04-25T10:15:30Z',
          },
        ],
        meta: {
          total: 1234,
          page: 1,
          page_size: 25,
          total_pages: 50,
        },
      };

      req.flush(mockResponse);
    });

    it('should include pagination metadata', (done) => {
      service.listTickets({ page: 1, page_size: 50 }).subscribe((response: TicketsListResponse) => {
        // Validate meta structure per contracts/tickets-api.md
        expect(response.meta.total).toBeDefined();
        expect(response.meta.page).toBe(1);
        expect(response.meta.page_size).toBe(50);
        expect(response.meta.total_pages).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/tickets?page=1&page_size=50`
      );

      const mockResponse: TicketsListResponse = {
        data: [],
        meta: {
          total: 100,
          page: 1,
          page_size: 50,
          total_pages: 2,
        },
      };

      req.flush(mockResponse);
    });

    it('should support filter parameters (priority, status)', (done) => {
      service
        .listTickets({
          page: 1,
          page_size: 25,
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

    it('should support sort parameter', (done) => {
      service
        .listTickets({
          page: 1,
          page_size: 25,
          sort: 'created_at:desc',
        })
        .subscribe(() => {
          done();
        });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${environment.apiBaseUrl}/tickets`) &&
          request.params.get('sort') === 'created_at:desc'
      );

      expect(req.request.method).toBe('GET');

      req.flush({
        data: [],
        meta: { total: 0, page: 1, page_size: 25, total_pages: 0 },
      });
    });

    it('should handle empty data array', (done) => {
      service.listTickets({ page: 2, page_size: 25 }).subscribe((response: TicketsListResponse) => {
        expect(response.data).toEqual([]);
        expect(response.meta.total).toBe(0);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/tickets?page=2&page_size=25`
      );

      req.flush({
        data: [],
        meta: { total: 0, page: 2, page_size: 25, total_pages: 0 },
      });
    });

    it('should handle null assigned_to fields', (done) => {
      service.listTickets({ page: 1, page_size: 25 }).subscribe((response: TicketsListResponse) => {
        const ticketWithoutAssignee = response.data[0];
        expect(ticketWithoutAssignee.assigned_to_id).toBeNull();
        expect(ticketWithoutAssignee.assigned_to_name).toBeNull();
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/tickets?page=1&page_size=25`
      );

      const mockResponse: TicketsListResponse = {
        data: [
          {
            id: '123',
            title: 'Test',
            description: 'Test',
            priority: 'low',
            status: 'open',
            assigned_to_id: null,
            assigned_to_name: null,
            created_at: '2026-04-25T10:15:30Z',
          },
        ],
        meta: { total: 1, page: 1, page_size: 25, total_pages: 1 },
      };

      req.flush(mockResponse);
    });
  });
});

