# Data Model: Page Size Selector Fix

**Feature**: 003-fix-page-size-selector  
**Date**: 2026-05-02  

## Overview

This document defines the data structures and state models required to fix the page size selector in the tickets dashboard. The fix involves proper state management for pagination, error handling, and coordinated updates between the MatPaginator UI component and the backend API.

---

## Core Data Structures

### 1. PaginationState

Represents the current pagination state of the tickets list.

```typescript
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
```

### 2. PageSizeChangeEvent

Represents a page size change action initiated by the user.

```typescript
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
```

### 3. PaginationError

Represents an error that occurred during pagination state change or data fetch.

```typescript
export interface PaginationError {
  /**
   * Type of error
   * 'FETCH' = API request failed
   * 'INVALID_STATE' = Page state became invalid
   * 'NETWORK' = Network error
   */
  type: 'FETCH' | 'INVALID_STATE' | 'NETWORK';
  
  /**
   * Human-readable error message
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
```

### 4. TicketsListState (Extended)

Represents the complete state of the tickets list, including pagination.

```typescript
export interface TicketsListState {
  /**
   * Array of tickets currently displayed
   */
  items: Ticket[];
  
  /**
   * Current pagination state
   */
  pagination: PaginationState;
  
  /**
   * Whether data is currently being fetched
   */
  isLoading: boolean;
  
  /**
   * Current error (if any), or null if no error
   */
  error: PaginationError | null;
  
  /**
   * Page size that the user selected but API request is still in flight
   * Used to display the intended page size in the selector while loading
   */
  attemptedPageSize?: number;
}
```

---

## State Transitions

### Page Size Change Flow

```
User selects new page size (e.g., 50)
  ↓
[PageSizeChange] Event fired by MatPaginator
  ↓
Component handler: onPageSizeChange(newSize)
  ↓
State Service: updatePageSize(newSize)
  1. Reset pageIndex to 0
  2. Set attemptedPageSize = newSize
  3. Set isLoading = true
  4. Emit state with new pageSize but same items (UI shows loading)
  ↓
API Service: fetchTickets(pageIndex=0, pageSize=newSize)
  ↓
Backend Response arrives
  ↓
State Service updates:
  1. items = response.items (new data)
  2. pageIndex = response.page
  3. pageSize = response.size
  4. totalItems = response.total
  5. totalPages = response.totalPages
  6. isLoading = false
  7. error = null
  8. attemptedPageSize = pageSize (sync)
  ↓
Component detects state change
  ↓
Component updates MatPaginator bindings
  ↓
View renders new data with page size reflected
```

### Error State Management

```
API Error occurs
  ↓
State Service catches error
  ↓
State Service updates:
  1. isLoading = false
  2. error = { type, message, statusCode, ... }
  3. items = [] (or keep last successful items - TBD)
  4. pageSize = previous successful pageSize (revert)
  5. pageIndex = previous successful pageIndex (revert)
  6. attemptedPageSize = undefined (clear attempted state)
  ↓
Component detects error in state.error
  ↓
Component shows error message to user
  ↓
MatPaginator reflects reverted page size
```

---

## Validation Rules

### Page Size Validation
- Must be one of: [10, 20, 50]
- Reject invalid values silently or show error
- Default to 20 if not specified

### Page Index Validation
- Must be >= 0
- Must be < totalPages
- Reset to 0 when page size changes
- Reset to last valid index on error

### Total Items Validation
- Must be >= 0
- If 0, totalPages must be 0 or 1
- If > 0 and pageSize = 50, totalPages = ceil(total/50)

---

## API Contract Integration

### Request Parameters

```typescript
interface TicketsApiRequest {
  page: number;      // 0-based page index
  size: number;      // Items per page (10, 20, or 50)
  // Other filters potentially included
  // sort?: string;
  // status?: string;
  // priority?: string;
}
```

### Response Structure

```typescript
interface TicketsApiResponse {
  items: Ticket[];
  page: number;        // Echoed page index (0-based)
  size: number;        // Echoed page size
  total: number;       // Total count of all tickets
  totalPages: number;  // Total pages using current size
}
```

---

## Implementation Notes

1. **Use RxJS BehaviorSubject** for reactive state management
   - State changes automatically propagate to subscribed components
   - Component can use `shareReplay()` to avoid multiple API calls if needed

2. **Debouncing Rapid Changes**
   - If user rapidly clicks page size multiple times, only the last selection should trigger an API call
   - Use `switchMap` to cancel in-flight requests if new change arrives
   - Do NOT debounceTime (confuses user who expects immediate feedback)

3. **Loading State Visual Feedback**
   - MatPaginator disabled during loading? Options:
     - Option A: Disable to prevent further changes (safest)
     - Option B: Keep enabled but ignore events (allows "user intent" tracking)
     - Recommended: Option A with brief disable (spec says "do not hide paginators")
   - Show skeleton or placeholder in table during loading

4. **Error Handling**
   - Keep page size selector visible even on error (spec requirement)
   - Show error message next to the selector or in a snack bar
   - Revert page size to last successful value after timeout or retry

5. **Edge Cases**
   - **Total items < page size**: e.g., 5 tickets total, user selects 50
     - totalPages = 1, show all 5 on page 1
     - selector should still show "50"
   - **Zero tickets**: totalPages = 0 or 1, no issue
   - **Rapid successive changes**: Last change wins (handled by switchMap)
   - **Session expiration during page change**: Redirect to login (auth interceptor handles)

---

**Status**: Ready for Phase 1 design and Phase 2 implementation.

