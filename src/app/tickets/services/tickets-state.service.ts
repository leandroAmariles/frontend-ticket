import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';

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

  /** Emits whenever a new load is requested — switchMap cancels the previous one */
  private readonly loadTrigger$ = new Subject<{ page: number; size: number }>();
  private readonly destroy$ = new Subject<void>();

  constructor(private apiService: TicketsApiService) {
    // Single long-lived subscription using switchMap to cancel in-flight requests.
    // catchError is placed INSIDE switchMap so errors from individual HTTP calls
    // are handled without terminating the outer subscription — Retry keeps working.
    this.loadTrigger$
      .pipe(
        switchMap(({ page, size }) => {
          this.loadingSubject.next(true);
          this.errorSubject.next(null);
          return this.apiService.getTickets(page, size).pipe(
            catchError((error: any) => {
              this.handleError(error);
              return EMPTY; // absorb the error; outer stream stays alive
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response: TicketsResponse) => this.handleSuccess(response),
      });
  }

  /**
   * Load (or reload) tickets. Cancels any in-flight request automatically.
   */
  loadTickets(page = 0, size = 20): void {
    this.loadTrigger$.next({ page, size });
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
    const errorMessage = error?.message || 'Error al cargar los tickets. Inténtalo de nuevo.';
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
