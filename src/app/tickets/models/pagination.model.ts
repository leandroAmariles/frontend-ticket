/**
 * Pagination Models for Tickets Feature
 * Defines data structures and state management for page size selection
 *
 * @file pagination.model.ts
 * @feature 003-fix-page-size-selector
 */

/**
 * PaginationState Interface
 * Represents the current pagination state of the tickets list
 *
 * @interface PaginationState
 */
export interface PaginationState {
  /**
   * Current page index (0-based)
   * Set to 0 when page size changes
   */
  pageIndex: number;

  /**
   * Current page size (number of items per page)
   * Options: 10, 20, 50
   * Default: 20
   */
  pageSize: number;

  /**
   * Total number of tickets matching current filters
   * Provided by backend
   */
  totalItems: number;

  /**
   * Total number of pages based on current page size
   * Calculated as: ceil(totalItems / pageSize)
   * Provided by backend in totalPages field
   */
  totalPages: number;

  /**
   * Timestamp of last successful state update
   */
  lastUpdated: number;
}

/**
 * PageSizeChangeEvent Interface
 * Represents a page size change action initiated by the user
 *
 * @interface PageSizeChangeEvent
 */
export interface PageSizeChangeEvent {
  /**
   * Previous page size before the change
   */
  oldSize: number;

  /**
   * New page size selected by user
   * Must be one of: 10, 20, 50
   */
  newSize: number;

  /**
   * Page index at the time of change request
   * Will be reset to 0 after change is processed
   */
  pageIndexAtChange: number;

  /**
   * Timestamp when change was initiated
   */
  timestamp: number;
}

/**
 * PaginationError Interface
 * Represents an error that occurred during pagination state change or data fetch
 *
 * @interface PaginationError
 */
export interface PaginationError {
  /**
   * Type of error:
   * - 'FETCH': API request failed
   * - 'INVALID_STATE': Page state became invalid
   * - 'NETWORK': Network error
   * - 'VALIDATION': Page size validation failed
   */
  type: 'FETCH' | 'INVALID_STATE' | 'NETWORK' | 'VALIDATION';

  /**
   * Human-readable error message for display to user
   */
  message: string;

  /**
   * HTTP status code (if applicable)
   */
  statusCode?: number;

  /**
   * Page size that was attempted
   */
  attemptedPageSize: number;

  /**
   * Timestamp when error occurred
   */
  timestamp: number;
}

/**
 * Extended Tickets List State
 * Extends the basic state with pagination-specific properties
 *
 * This should be merged with the existing TicketsListState interface
 * or used as the complete state definition for the tickets feature
 *
 * @interface TicketsListStateExtended
 */
export interface TicketsListStateExtended {
  /**
   * Current pagination state
   */
  pagination: PaginationState;

  /**
   * Whether data is currently being fetched from the API
   */
  isLoading: boolean;

  /**
   * Current error (if any), or null if no error
   * Displayed to user in error message
   */
  error: PaginationError | null;

  /**
   * Page size that the user selected but API request is still in flight
   * Used to display the intended page size in the selector while loading
   * Implements optimistic UI update pattern
   *
   * When user selects size 50:
   * 1. attemptedPageSize = 50 (immediately)
   * 2. isLoading = true
   * 3. UI shows selector as 50 (even before API responds)
   * 4. API call with size=50 in flight
   * 5. On success: clear attemptedPageSize, pagination.pageSize = 50
   * 6. On error: keep attemptedPageSize = 50, show error, revert pagination.pageSize
   */
  attemptedPageSize?: number;
}

