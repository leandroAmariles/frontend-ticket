/**
 * Unit tests for re-query default configuration
 * Validates that the re-query timing strategy is correctly implemented
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketsApiService } from '../../services/tickets-api.service';
import { environment } from '../../../../environments/environment';
import { Ticket, TicketsListResponse } from '../../models';

describe('Re-query Strategy - Defaults', () => {
  let service: TicketsStateService;
  let apiService: TicketsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TicketsStateService, TicketsApiService],
    });

    service = TestBed.inject(TicketsStateService);
    apiService = TestBed.inject(TicketsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Re-query Configuration', () => {
    it('should have correct default re-query interval', () => {
      expect(environment.reQuery.initialInterval).toBe(500); // 500ms per plan.md
    });

    it('should have correct max interval', () => {
      expect(environment.reQuery.maxInterval).toBe(2000); // 2000ms per plan.md
    });

    it('should have correct max duration', () => {
      expect(environment.reQuery.maxDuration).toBe(5000); // 5 seconds per plan.md
    });

    it('should have correct backoff multiplier', () => {
      expect(environment.reQuery.backoffMultiplier).toBe(2); // Exponential doubling
    });
  });

  describe('Re-query Execution', () => {
    it('should find ticket within initial interval', fakeAsync(() => {
      const testTicket: Ticket = {
        id: 'ticket-123',
        title: 'Test Ticket',
        description: 'Test',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      let foundTicket: Ticket | null = null;

      // Start re-query
      service.reQueryForNewTicket('ticket-123', (ticket) => {
        foundTicket = ticket;
      }).subscribe();

      // Advance to first poll (500ms)
      tick(500);

      // Respond to the first request immediately
      const req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );

      const response: TicketsListResponse = {
        data: [testTicket],
        meta: {
          total: 1,
          page: 1,
          page_size: 25,
          total_pages: 1,
        },
      };

      req.flush(response);

      // Ticket should be found
      expect(foundTicket?.id).toBe('ticket-123');
    }));

    it('should retry with exponential backoff', fakeAsync(() => {
      const testTicket: Ticket = {
        id: 'ticket-456',
        title: 'Found After Backoff',
        description: 'Test',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      let foundTicket: Ticket | null = null;
      let pollCount = 0;

      service.reQueryForNewTicket('ticket-456', (ticket) => {
        foundTicket = ticket;
      }).subscribe();

      // First poll at 500ms - ticket not found
      tick(500);
      pollCount++;
      let req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );

      req.flush({
        data: [],
        meta: { total: 0, page: 1, page_size: 25, total_pages: 0 },
      });

      // Second poll at 500 + 1000 = 1500ms (backoff: 500 * 2) - ticket found
      tick(1000);
      pollCount++;
      req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );

      const response: TicketsListResponse = {
        data: [testTicket],
        meta: {
          total: 1,
          page: 1,
          page_size: 25,
          total_pages: 1,
        },
      };

      req.flush(response);

      expect(pollCount).toBe(2);
      expect(foundTicket?.id).toBe('ticket-456');
    }));

    it('should not poll beyond max duration', fakeAsync(() => {
      let pollCount = 0;

      service.reQueryForNewTicket('non-existent-ticket').subscribe();

      // Perform polls until max duration exceeded
      // Initial interval: 500ms
      // After 1st poll (500ms): retry at 1000ms (500*2), total: 1500ms
      // After 2nd poll (1000ms): retry at 2000ms (1000*2=2000max), total: 3500ms
      // After 3rd poll (2000ms): would be at 5500ms - exceeds max of 5000ms, stop

      tick(500);
      pollCount++;
      let req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      tick(1000);
      pollCount++;
      req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      tick(2000);
      pollCount++;
      req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      // Should not make more requests after max duration
      tick(2000);
      httpMock.expectNone((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );

      expect(pollCount).toBeLessThanOrEqual(5); // Max attempts around 5
    }));

    it('should stop polling when ticket is found', fakeAsync(() => {
      const testTicket: Ticket = {
        id: 'quick-ticket',
        title: 'Found Quickly',
        description: 'Test',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      let requestCount = 0;

      service.reQueryForNewTicket('quick-ticket').subscribe();

      // First poll finds the ticket
      tick(500);
      requestCount++;
      const req = httpMock.expectOne((request) => {
        requestCount++;
        return request.url.includes(`${environment.apiBaseUrl}/tickets`);
      });

      const response: TicketsListResponse = {
        data: [testTicket],
        meta: {
          total: 1,
          page: 1,
          page_size: 25,
          total_pages: 1,
        },
      };

      req.flush(response);

      // Try to advance time further - should not make additional requests
      tick(2000);
      httpMock.expectNone((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );

      // Only 1 request should have been made
      expect(requestCount).toBeLessThanOrEqual(2);
    }));

    it('should handle ticket not found after max duration', fakeAsync(() => {
      let foundTicket: Ticket | null | undefined;

      service.reQueryForNewTicket('never-found-ticket', (ticket) => {
        foundTicket = ticket;
      }).subscribe((result) => {
        foundTicket = result;
      });

      // Keep ticking until past max duration (5000ms)
      tick(500);
      let req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      tick(1000);
      req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      tick(2000);
      req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      tick(2000);
      // Should stop polling after ~5000ms

      // Verify no final ticket was found
      expect(foundTicket).toBe(null) || expect(foundTicket).toBeUndefined();
    }));
  });

  describe('Re-query Cancellation', () => {
    it('should cancel polling when cancelReQuery is called', fakeAsync(() => {
      service.reQueryForNewTicket('ticket-to-cancel').subscribe();

      tick(500);
      const req = httpMock.expectOne((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
      req.flush({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } });

      // Cancel polling
      service.cancelReQuery();

      // Try to advance time - should not make additional requests
      tick(2000);
      httpMock.expectNone((request) =>
        request.url.includes(`${environment.apiBaseUrl}/tickets`)
      );
    }));
  });
});

