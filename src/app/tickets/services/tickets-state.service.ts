import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Ticket, TicketsResponse } from '../models';
import { TicketsApiService } from './tickets-api.service';

/**
 * Tickets State Service
 * Manages global state for the tickets feature
 * Responsibilities:
 * - Maintain current tickets list, loading state, and error messages
 * - Coordinate API calls via TicketsApiService
 * - Handle state transitions (loading → success/error → idle)
 * - Provide observables for component consumption
 * - Clean up subscriptions on service destroy
 */
@Injectable({
  providedIn: 'root',
})
export class TicketsStateService implements OnDestroy {
  // State subjects
  private readonly ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  public readonly tickets$ = this.ticketsSubject.asObservable();

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  public readonly error$ = this.errorSubject.asObservable();

  // Pagination metadata
  private readonly paginationSubject = new BehaviorSubject<{
    page: number;
    size: number;
    total: number;
    totalPages: number;
  } | null>(null);
  public readonly pagination$ = this.paginationSubject.asObservable();

  // Cleanup signal
  private readonly destroy$ = new Subject<void>();

  constructor(private apiService: TicketsApiService) {}

  /**
   * Load tickets from the API
   * Manages loading and error states automatically
   *
   * @param page - Page number (0-indexed), defaults to 0
   * @param size - Page size, defaults to 20
   */
  loadTickets(page: number = 0, size: number = 20): void {
    // Set loading state
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Call API service
    this.apiService
      .getTickets(page, size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: TicketsResponse) => {
          this.handleSuccess(response);
        },
        error: (error: any) => {
          this.handleError(error);
        },
      });
  }

  /**
   * Handle successful API response
   * Updates tickets and pagination state
   */
  private handleSuccess(response: TicketsResponse): void {
    this.ticketsSubject.next(response.items);
    this.paginationSubject.next({
      page: response.page,
      size: response.size,
      total: response.total,
      totalPages: response.totalPages,
    });
    this.loadingSubject.next(false);
  }

  /**
   * Handle API error response
   * Extracts user-friendly message and updates error state
   */
  private handleError(error: any): void {
    const errorMessage = error?.message || 'Failed to load tickets. Please try again.';
    this.errorSubject.next(errorMessage);
    this.loadingSubject.next(false);
  }

  /**
   * Get the current list of tickets
   */
  getTickets(): Ticket[] {
    return this.ticketsSubject.value;
  }

  /**
   * Get a ticket by ID from the current state
   */
  getTicketById(id: string): Ticket | undefined {
    return this.getTickets().find((t) => t.id === id);
  }

  /**
   * Re-query for a new ticket (placeholder for future implementation)
   * NOTE: This feature is out of scope for the 002-consume-backend-api feature
   *
   * @param targetTicketId - ID of ticket to search for
   * @param onSuccess - Callback when ticket is found
   * @returns Observable that completes when ticket is found or timeout
   */
  reQueryForNewTicket(
    targetTicketId: string,
    onSuccess?: (ticket: Ticket) => void
  ): Observable<Ticket | null> {
    // TODO: Implement re-query logic for newly created tickets
    return of(null);
  }

  /**
   * Clear all state (useful when component is destroyed or user navigates away)
   */
  reset(): void {
    this.ticketsSubject.next([]);
    this.paginationSubject.next(null);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
  }

  /**
   * Angular lifecycle hook
   * Cleans up subscriptions when service is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

