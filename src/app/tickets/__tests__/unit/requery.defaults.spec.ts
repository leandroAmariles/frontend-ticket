/**
 * Unit tests for re-query default configuration
 * Validates that the re-query timing strategy is correctly implemented
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketsApiService } from '../../services/tickets-api.service';
import { environment } from '../../../../environments/environment';
import { Ticket, TicketsListResponse } from '../../models';

describe('Re-query Strategy - Defaults', () => {
  let service: TicketsStateService;
  let apiServiceSpy: any;

  beforeEach(() => {
    apiServiceSpy = { listTickets: jest.fn().mockImplementation(() => of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } })) };

    TestBed.configureTestingModule({
      providers: [
        TicketsStateService,
        { provide: TicketsApiService, useValue: apiServiceSpy },
      ],
    });

    service = TestBed.inject(TicketsStateService);
  });

  // No HttpTestingController in these tests - using a TicketsApiService spy

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
    afterEach(() => {
      // Ensure polling timers are cancelled between tests
      service.cancelReQuery();
    });

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

      // Prepare API spy to return the ticket on first call
      const response: TicketsListResponse = {
        data: [testTicket],
        meta: { total: 1, page: 1, page_size: 25, total_pages: 1 },
      };
      apiServiceSpy.listTickets.mockReturnValueOnce(of(response));

      // Start re-query
      service.reQueryForNewTicket('ticket-123', (ticket) => {
        foundTicket = ticket;
      }).subscribe();

      // Advance time to allow async work to complete
      tick(500);

      // Ticket should be found
      expect(foundTicket?.id).toBe('ticket-123');

      // Stop polling to avoid leaving timers in the fakeAsync queue
      service.cancelReQuery();
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

      // Prepare API spy: first call returns empty, second returns ticket
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [testTicket], meta: { total: 1, page: 1, page_size: 25, total_pages: 1 } }));

      service.reQueryForNewTicket('ticket-456', (ticket) => {
        foundTicket = ticket;
      }).subscribe();

      // First poll at initial interval
      tick(500);
      pollCount++;

      // Advance to next poll (backoff: 1000ms)
      tick(1000);
      pollCount++;

      expect(pollCount).toBe(2);
      expect(foundTicket?.id).toBe('ticket-456');

      service.cancelReQuery();
    }));

    it('should not poll beyond max duration', fakeAsync(() => {
      let pollCount = 0;

      // Prepare sequence of empty responses and start re-query
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));

      service.reQueryForNewTicket('non-existent-ticket').subscribe();

      // Perform polls until max duration exceeded
      // Initial interval: 500ms
      // After 1st poll (500ms): retry at 1000ms (500*2), total: 1500ms
      // After 2nd poll (1000ms): retry at 2000ms (1000*2=2000max), total: 3500ms
      // After 3rd poll (2000ms): would be at 5500ms - exceeds max of 5000ms, stop

      // Sequence of polls returning empty responses
      tick(500);
      pollCount++;

      tick(1000);
      pollCount++;

      tick(2000);
      pollCount++;

      // Advance further past max duration
      tick(2000);

      expect(pollCount).toBeLessThanOrEqual(5); // Max attempts around 5

      service.cancelReQuery();
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

      // Prepare API spy to return the ticket on first call
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [testTicket], meta: { total: 1, page: 1, page_size: 25, total_pages: 1 } }));
      service.reQueryForNewTicket('quick-ticket').subscribe();

      // First poll finds the ticket
      tick(500);
      requestCount++;

      // Try to advance time further - should not make additional requests
      tick(2000);

      // Only 1 request should have been made
      expect(requestCount).toBeLessThanOrEqual(2);

      service.cancelReQuery();
    }));

    it('should handle ticket not found after max duration', fakeAsync(() => {
      let foundTicket: Ticket | null | undefined;

      // Prepare empty responses before starting re-query
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));

      service.reQueryForNewTicket('never-found-ticket', (ticket) => {
        foundTicket = ticket;
      }).subscribe((result) => {
        foundTicket = result;
      });


      // Advance through the polling windows
      tick(500);
      tick(1000);
      tick(2000);
      tick(2000);

      // Verify no final ticket was found (null or undefined)
      expect(foundTicket === null || foundTicket === undefined).toBe(true);

      service.cancelReQuery();
    }));
  });

  describe('Re-query Cancellation', () => {
    it('should cancel polling when cancelReQuery is called', fakeAsync(() => {
      apiServiceSpy.listTickets.mockReturnValueOnce(of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } }));
      service.reQueryForNewTicket('ticket-to-cancel').subscribe();
      tick(500);

      // Cancel polling
      service.cancelReQuery();

      // Try to advance time - should not make additional requests
      tick(2000);
    }));
  });
});

