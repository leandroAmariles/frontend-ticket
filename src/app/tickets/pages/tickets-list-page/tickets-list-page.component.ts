import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsStateService } from '../../services/tickets-state.service';
import { Ticket } from '../../models';

/**
 * Tickets List Page Component
 * Displays paginated list of tickets fetched from the backend API
 *
 * Responsibilities:
 * - Load tickets on component initialization
 * - Display loading spinner while fetching
 * - Display ticket table when data arrives
 * - Display error messages and retry button on failure
 * - Handle pagination and filtering
 * - Clean up subscriptions on destroy
 */
@Component({
  selector: 'app-tickets-list-page',
  templateUrl: './tickets-list-page.component.html',
  styleUrls: ['./tickets-list-page.component.scss'],
})
export class TicketsListPageComponent implements OnInit, OnDestroy {
  // Observables from state service
  tickets$ = this.ticketsState.tickets$;
  loading$ = this.ticketsState.loading$;
  error$ = this.ticketsState.error$;
  pagination$ = this.ticketsState.pagination$;

  // Cleanup signal
  private readonly destroy$ = new Subject<void>();

  // Current pagination state
  private currentPage = 0;
  private currentSize = 20;

  constructor(
    private ticketsState: TicketsStateService,
    private router: Router
  ) {}

  /**
   * Angular lifecycle hook
   * Load tickets on component initialization
   */
  ngOnInit(): void {
    this.loadTickets();
  }

  /**
   * Angular lifecycle hook
   * Clean up subscriptions and reset state on destroy
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ticketsState.reset();
  }

  /**
   * Load tickets from the API
   * Called on init and when user retries after error
   *
   * @param page - Page number (0-indexed), defaults to 0
   * @param size - Page size, defaults to 20
   */
  loadTickets(page: number = 0, size: number = 20): void {
    this.currentPage = page;
    this.currentSize = size;
    this.ticketsState.loadTickets(page, size);
  }

  /**
   * Retry loading tickets after an error
   * Clears error state and attempts to reload
   */
  onRetry(): void {
    this.loadTickets(this.currentPage, this.currentSize);
  }

  /**
   * Handle pagination changes
   *
   * @param event - Pagination event from Material paginator
   */
  onPageChange(event: any): void {
    this.loadTickets(event.pageIndex, event.pageSize);
  }

  /**
   * Navigate to create ticket page
   */
  navigateToCreate(): void {
    this.router.navigate(['/tickets/new']);
  }

  /**
   * Track by function for ngFor optimization
   * Prevents unnecessary re-rendering of ticket rows
   *
   * @param index - Index of item in list
   * @param ticket - Ticket object
   * @returns Unique identifier for the ticket
   */
  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}

