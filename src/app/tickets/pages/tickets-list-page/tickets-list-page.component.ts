import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsStateService } from '../../services/tickets-state.service';
import { Ticket } from '../../models';
import { TicketCreateDialogComponent } from '../../components/ticket-create-dialog/ticket-create-dialog.component';

/**
 * Tickets List Page Component
 * Displays paginated list of tickets fetched from the backend API
 *
 * This component manages the main tickets dashboard view. It:
 * - Loads tickets from the backend API via TicketsStateService
 * - Displays loading state (spinner) while data is being fetched
 * - Shows ticket data in a paginated table once loaded
 * - Displays user-friendly error messages if the API request fails
 * - Provides a retry button to recover from transient errors
 * - Handles pagination changes and passes them to the state service
 * - Properly cleans up subscriptions to prevent memory leaks
 *
 * **State Management**:
 * The component uses RxJS observables from TicketsStateService to manage state:
 * - `tickets$`: Observable<Ticket[]> - Current page of tickets
 * - `loading$`: Observable<boolean> - Loading state indicator
 * - `error$`: Observable<string | null> - Error message (null if no error)
 * - `pagination$`: Observable<PaginationMetadata> - Page info (page, size, total, etc.)
 *
 * **Accessibility**:
 * - Loading spinner has aria-label for screen readers
 * - Error messages use role="alert" for announcements
 * - Buttons have aria-labels for clarity
 * - Main container has role="main" for semantic structure
 *
 * **User Flows**:
 * 1. Page loads → loadTickets() called → loading$ = true
 * 2. API returns data → tickets$ updated → loading$ = false
 * 3. User sees table of tickets
 * 4. User changes page → onPageChange() → new request
 * 5. If error occurs → error$ populated → retry button shown
 * 6. User clicks retry → onRetry() → attempt reload
 *
 * @component
 */
@Component({
    selector: 'app-tickets-list-page',
    templateUrl: './tickets-list-page.component.html',
    styleUrls: ['./tickets-list-page.component.scss'],
    standalone: false
})
export class TicketsListPageComponent implements OnInit, OnDestroy {
  /**
   * Observable of tickets for the current page
   * Populated by TicketsStateService.loadTickets()
   * Emits when new data arrives from the API
   */
  tickets$ = this.ticketsState.tickets$;

  /**
   * Observable indicating whether tickets are currently being loaded
   * Useful for showing/hiding loading spinners
   * Emitted by TicketsStateService during fetch operations
   */
  loading$ = this.ticketsState.loading$;

  /**
   * Observable of error message if the last API request failed
   * null when no error exists
   * Useful for displaying error alerts to the user
   * Can be recovered with onRetry() method
   */
  error$ = this.ticketsState.error$;

  /**
   * Observable of pagination metadata
   * Contains: page, size, total, totalPages
   * Used by paginator component to enable/disable controls
   */
  pagination$ = this.ticketsState.pagination$;

  /**
   * Page size the user picked but whose request is still in flight
   * (feature 003-fix-page-size-selector, US2). Bound into the table's
   * paginator so the selector shows the new value immediately instead of
   * waiting for pagination$ to update.
   */
  attemptedPageSize$ = this.ticketsState.attemptedPageSize$;

  /**
   * RxJS Subject used for cleanup pattern
   * When ngOnDestroy is called, next() emits and all takeUntil() unsubscribe
   * This prevents memory leaks from lingering subscriptions
   * @private
   */
  private readonly destroy$ = new Subject<void>();

  /**
   * Tracks the current page index for pagination
   * Used when retrying to re-request the same page
   * @private
   */
  private currentPage = 0;

  /**
   * Tracks the current page size (items per page)
   * Used when retrying to re-request the same page size
   * Typically 20 items per page but can be customized
   * @private
   */
  private currentSize = 20;

  /**
   * Constructor - Dependency Injection
   * @param ticketsState Service managing ticket data and loading state
   * @param router Angular Router for navigation (e.g., to create ticket page)
   */
  constructor(
    private ticketsState: TicketsStateService,
    private dialog: MatDialog
  ) {}

  /**
   * Angular lifecycle hook - Component Initialization
   * Called once when the component is created
   *
   * **Responsibilities**:
   * - Automatically load the initial set of tickets (page 0, size 20)
   * - Set loading$ observable to true (shows spinner)
   * - Trigger the API request via TicketsStateService
   *
   * **Error Handling**: If the API request fails, error$ will be populated
   * and the user will see an error message with a retry button.
   *
   * @lifecycle Fires once after component construction
   */
  ngOnInit(): void {
    this.loadTickets();
  }

  /**
   * Angular lifecycle hook - Component Destruction
   * Called once when component is destroyed (e.g., user navigates away)
   *
   * **Responsibilities**:
   * - Signal all subscriptions to unsubscribe using destroy$ Subject
   * - Complete the destroy$ subject
   * - Reset tickets state (clears tickets, loading, error)
   *
   * **Why This Matters**: Without cleanup, subscriptions will continue to listen
   * to state service changes even after the component is gone, causing:
   * - Memory leaks (RAM accumulation)
   * - Unexpected behavior (stale subscriptions updating old component)
   * - Performance degradation over time
   *
   * **Pattern Used**: takeUntil(this.destroy$) - Common RxJS cleanup pattern
   *
   * @lifecycle Fires once when component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ticketsState.reset();
  }

  /**
   * Load tickets from the backend API
   * This is the main method for fetching ticket data
   *
   * **Flow**:
   * 1. Store pagination parameters (page, size) in component for retry
   * 2. Call TicketsStateService.loadTickets(page, size)
   * 3. State service sets loading$ = true (shows spinner)
   * 4. HTTP GET request made to /api/v1/tickets/all?page=X&size=Y
   * 5. Interceptor injects Authorization header with token
   * 6. On success: tickets$, pagination$ updated, loading$ = false
   * 7. On error: error$ populated, loading$ = false, user sees error
   *
   * **Parameters**:
   * @param page - Zero-indexed page number (0 = first page, 1 = second, etc.)
   *               Defaults to 0. Used to offset which tickets are returned.
   * @param size - Number of items per page (defaults to 20).
   *               Must be <= server's max page size.
   *
   * **Example**:
   * ```typescript
   * // Load first page with default size
   * this.loadTickets();
   *
   * // Load second page with 50 items per page
   * this.loadTickets(1, 50);
   * ```
   *
   * @see TicketsStateService.loadTickets()
   */
  loadTickets(page = 0, size = 20): void {
    this.currentPage = page;
    this.currentSize = size;
    this.ticketsState.loadTickets(page, size);
  }

  /**
   * Retry loading tickets after an error
   * Called when user clicks the "Retry" button in the error message
   *
   * **What It Does**:
   * 1. Uses the last known good pagination params (currentPage, currentSize)
   * 2. Calls loadTickets with those parameters
   * 3. Clears the error$ observable (removes error message from UI)
   * 4. Shows loading spinner again
   * 5. Makes new API request
   *
   * **Why Use This**:
   * - Transient network errors can be recovered from
   * - Temporary server unavailability can be retried
   * - User stays on same page they were viewing
   *
   * **Example Scenario**:
   * 1. User on page 2 viewing tickets
   * 2. Network connection lost
   * 3. Error message shown: "Unable to connect to server"
   * 4. User clicks Retry button
   * 5. onRetry() is called
   * 6. loadTickets(2, 20) executed with same page params
   * 7. If network restored, data loads for page 2
   *
   * @see loadTickets()
   */
  onRetry(): void {
    this.loadTickets(this.currentPage, this.currentSize);
  }

  /**
   * Handle pagination changes from the table's paginator
   * Called when user clicks a different page in the paginator controls
   *
   * **What Happens**:
   * 1. User clicks page 2 in the paginator
   * 2. Paginator emits pageChange event
   * 3. This method receives the event
   * 4. Extracts pageIndex and pageSize from event
   * 5. Calls loadTickets(pageIndex, pageSize)
   * 6. New API request for the selected page
   *
   * **Event Structure**:
   * ```typescript
   * // Angular Material MatPaginator emits paginator.page events:
   * {
   *   pageIndex: 2,    // The user selected page 2 (0-indexed)
   *   pageSize: 20,    // Current page size
   *   previousPageIndex: 1,  // Previous page (for undo logic if needed)
   *   length: 100      // Total number of items
   * }
   * ```
   *
   * @param event - MatPaginatorEvents or similar pagination event object
   *                Must contain pageIndex and pageSize properties
   *
   * @see loadTickets()
   */
  onPageChange(event: any): void {
    this.loadTickets(event.pageIndex, event.pageSize);
  }

  /**
   * Handle a page SIZE change from the table's paginator (feature
   * 003-fix-page-size-selector). Distinct from onPageChange(): this always
   * resets to page 0 and goes through TicketsStateService.updatePageSize(),
   * which also does the optimistic "attemptedPageSize" update so the
   * selector shows the new value immediately instead of waiting for the API.
   *
   * @param event - object with the new pageSize (MatPaginator's PageEvent
   *                shape works here too, only .pageSize is used)
   */
  onPageSizeChange(event: { pageSize: number }): void {
    this.ticketsState.updatePageSize(event.pageSize);
  }

  /**
   * Open the "create ticket" dialog.
   * Called when user clicks the "+ New Ticket" button.
   * If the dialog closes with a truthy result (ticket was created),
   * reloads the current page/size so the new ticket shows up.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TicketCreateDialogComponent, {
      width: '560px',
      autoFocus: 'first-tabbable',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((created: boolean | undefined) => {
        if (created) {
          this.loadTickets(this.currentPage, this.currentSize);
        }
      });
  }

  /**
   * Track by function for ngFor performance optimization
   * Used by *ngFor="let ticket of tickets; trackBy: trackByTicketId"
   * Helps Angular identify which tickets have changed to avoid re-rendering
   *
   * **How It Works**:
   * Without trackBy:
   * - Angular compares entire ticket object on each change detection
   * - If array order changes, ALL tickets re-render (expensive!)
   * - Causes flicker, performance issues
   *
   * With trackBy:
   * - Angular uses the returned ID to identify each ticket
   * - Only tickets with NEW/DELETED IDs are re-rendered
   * - Same ticket ID in different position doesn't re-render
   * - Massive performance improvement (10x+ for large lists)
   *
   * **Example**:
   * If tickets change from [1,2,3] to [1,3,2]:
   * - Without trackBy: Re-renders all 3 tickets (O(n))
   * - With trackBy: Only detects position change, minimal re-render (O(1))
   *
   * @param index - Index position of ticket in array (unused but required)
   * @param ticket - The ticket object
   * @returns Unique identifier for the ticket (used by Angular change detection)
   *
   * @see https://angular.io/guide/common/improving-performance-with-trackby
   */
  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}

