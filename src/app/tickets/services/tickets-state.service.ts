import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap, catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Ticket, TicketsListParams, TicketsListResponse } from '../models';
import { TicketsApiService } from './tickets-api.service';

@Injectable({
  providedIn: 'root',
})
export class TicketsStateService {
  // State subjects
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  private metaSubject = new BehaviorSubject<any>(null);
  public meta$ = this.metaSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // Current query parameters
  private currentParams: TicketsListParams = {
    page: 1,
    page_size: 25,
  };

  // Re-query configuration
  private readonly reQueryConfig = environment.reQuery;

  constructor(private apiService: TicketsApiService) {}

  /**
   * Fetch tickets with given parameters
   */
  refresh(params?: Partial<TicketsListParams>): Observable<TicketsListResponse> {
    if (params) {
      this.currentParams = { ...this.currentParams, ...params };
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.apiService.listTickets(this.currentParams).pipe(
      tap((response: TicketsListResponse) => {
        this.ticketsSubject.next(response.data);
        this.metaSubject.next(response.meta);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.errorSubject.next(error?.message || 'Failed to fetch tickets');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  /**
   * Re-query strategy: poll for a newly created ticket with exponential backoff
   * This ensures newly created tickets appear in the list within the target window
   */
  reQueryForNewTicket(
    targetTicketId: string,
    onSuccess?: (ticket: Ticket) => void
  ): Observable<Ticket | null> {
    const { initialInterval, maxInterval, maxDuration, backoffMultiplier = 2 } = this.reQueryConfig;

    let currentInterval = initialInterval;
    let elapsedTime = 0;
    const startTime = Date.now();

    return timer(0, currentInterval).pipe(
      switchMap(() => {
        elapsedTime = Date.now() - startTime;

        // Check if we've exceeded max duration
        if (elapsedTime > maxDuration) {
          console.warn(`Re-query timeout: ticket ${targetTicketId} not found within ${maxDuration}ms`);
          return of(null);
        }

        // Fetch current tickets
        return this.apiService.listTickets({
          page: 1,
          page_size: this.currentParams.page_size || 25,
        }).pipe(
          tap((response: TicketsListResponse) => {
            // Update the ticket found in response
            const foundTicket = response.data.find((t) => t.id === targetTicketId);
            if (foundTicket && onSuccess) {
              onSuccess(foundTicket);
            }
          }),
          catchError(() => of(null))
        );
      }),
      switchMap((response) => {
        if (!response) {
          return of(null);
        }

        const foundTicket = response.data.find((t) => t.id === targetTicketId);
        if (foundTicket) {
          // Ticket found, stop polling
          return of(foundTicket);
        }

        // Ticket not found yet, continue polling with backoff
        currentInterval = Math.min(currentInterval * backoffMultiplier, maxInterval);
        return timer(currentInterval).pipe(
          switchMap(() => of(null))
        );
      }),
      takeUntil(this.getStopReQuerySignal())
    );
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
   * Update current query parameters
   */
  setParams(params: Partial<TicketsListParams>): void {
    this.currentParams = { ...this.currentParams, ...params };
  }

  /**
   * Get current parameters
   */
  getParams(): TicketsListParams {
    return { ...this.currentParams };
  }

  /**
   * Signal to stop re-query polling (e.g., when user navigates away)
   */
  private stopReQuerySubject = new BehaviorSubject<void>(undefined);

  private getStopReQuerySignal(): Observable<void> {
    return this.stopReQuerySubject.asObservable();
  }

  /**
   * Cancel ongoing re-query polling
   */
  cancelReQuery(): void {
    this.stopReQuerySubject.next();
  }

  /**
   * Reset state (useful when component is destroyed or user navigates away)
   */
  reset(): void {
    this.ticketsSubject.next([]);
    this.metaSubject.next(null);
    this.loadingSubject.next(false);
    this.errorSubject.next(null);
    this.cancelReQuery();
  }
}

