# API Contract: Pagination Management

**Feature**: 003-fix-page-size-selector  
**Date**: 2026-05-02  
**Scope**: Frontend component-to-service interaction and frontend-to-backend API contract

---

## Overview

This contract defines how the tickets dashboard pagination works: the interaction between the MatPaginator component, the state management service, and the backend API. It ensures the page size selector and pagination controls work together correctly.

---

## 1. Frontend: MatPaginator Component Interface

### Input Properties

```typescript
@Input() pageSizeOptions: number[] = [10, 20, 50];
@Input() pageSize: number = 20;  // Current page size
@Input() pageIndex: number = 0;  // Current page (0-based)
@Input() length: number = 0;     // Total items (from pagination.totalItems)
@Input() disabled: boolean = false; // Disable during loading
```

### Output Events

```typescript
@Output() page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
@Output() pageSizeChange: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
```

Event payload:
```typescript
interface PageEvent {
  pageIndex: number;   // New page index
  pageSize: number;    // New page size
  length: number;      // Total items (same as @Input length)
  previousPageIndex?: number;
}
```

### Behavior Contract

**When user clicks page size selector:**
1. Component fires `pageSizeChange` event immediately (no waiting for API)
2. `PageEvent.pageSize` = selected value (10, 20, or 50)
3. `PageEvent.pageIndex` = current page before change
4. Event fires synchronously (visual feedback immediate)

**When user clicks pagination arrow:**
1. Component fires `page` event with new pageIndex
2. Only the pageIndex changes, pageSize stays same

---

## 2. Frontend: State Service Contract

### Input: `TicketsStateService`

**Method**: `updatePageSize(newSize: number): void`

```typescript
/**
 * Handle user's page size selection from the UI
 * @param newSize - New page size (10, 20, or 50)
 * 
 * Side Effects:
 *   1. Resets pageIndex to 0
 *   2. Sets isLoading to true
 *   3. Emits updated state
 *   4. Triggers API call to fetch tickets with new size
 */
updatePageSize(newSize: number): void
```

**Method**: `updatePageIndex(newIndex: number): void`

```typescript
/**
 * Handle user's page navigation click
 * @param newIndex - New page index (0-based)
 * 
 * Side Effects:
 *   1. Validates newIndex >= 0 and < totalPages
 *   2. Sets isLoading to true
 *   3. Emits updated state
 *   4. Triggers API call with current page size
 */
updatePageIndex(newIndex: number): void
```

### Output: `TicketsStateService` Observable

```typescript
ticketsState$: Observable<TicketsListState> = ...
```

Emits on state change with this structure:

```typescript
{
  items: Ticket[],
  pagination: {
    pageIndex: number,      // 0-based
    pageSize: number,       // 10, 20, or 50
    totalItems: number,     // From API
    totalPages: number,     // From API
    lastUpdated: number     // Timestamp
  },
  isLoading: boolean,
  error: PaginationError | null,
  attemptedPageSize?: number  // If in progress
}
```

### Validation Guarantees

- `pageSize`: Always one of [10, 20, 50]
- `pageIndex`: Always >= 0 and < totalPages (after state settles)
- `totalItems`: Always >= 0
- `totalPages`: Always >= 0
- On error: state reverts to last successful pagination values

---

## 3. Backend: GET /api/v1/tickets/all

### Request Format

```http
GET /api/v1/tickets/all?page=0&size=20 HTTP/1.1
Host: localhost:8080
Authorization: Bearer {access_token}
Accept: application/json
```

### Query Parameters

| Parameter | Type | Required | Valid Values | Default | Description |
|-----------|------|----------|--------------|---------|-------------|
| `page` | Integer | Yes | >= 0 | 0 | Page index (0-based) |
| `size` | Integer | Yes | 10, 20, 50 | 20 | Items per page |
| `sort` | String | No | field,direction | - | Optional sort order |

### Request Validation (Frontend Enforces)

- `page` must be < `totalPages` or = 0
- `size` must be in [10, 20, 50]
- Only include sort if filtering/sorting is active

### Response Format (200 OK)

```json
{
  "items": [
    {
      "id": "uuid-1",
      "titulo": "Ticket 1 Title",
      "descripcion": "Description text",
      "status": "PENDING",
      "creatorId": "user-id",
      "fecha": "2026-04-01",
      "createdAt": "2026-04-01T10:00:00Z",
      "updatedAt": "2026-04-01T10:00:00Z"
    },
    ...
  ],
  "page": 0,
  "size": 20,
  "total": 247,
  "totalPages": 13
}
```

### Response Validation (Frontend Enforces)

```typescript
// After API call returns, frontend MUST verify:
if (response.items.length > response.size) {
  // ERROR: Backend sent more items than requested size
  // Handle as API contract violation
}

if (response.page !== requestedPage) {
  // WARNING: Echo page mismatch, but accept response
}

if (response.size !== requestedSize) {
  // ERROR: Size mismatch, reject response
}

if (!Number.isInteger(response.total) || response.total < 0) {
  // ERROR: Invalid total count
}

// Calculate expected totalPages:
const expectedPages = Math.ceil(response.total / response.size);
if (Math.abs(response.totalPages - expectedPages) > 1) {
  // WARNING: totalPages calculation mismatch
  // Use response.totalPages (server source of truth)
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Token expired or invalid"
}
```

**Frontend Response**: Auth interceptor redirects to login. Do NOT show pagination error message.

#### 404 Not Found

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Tickets endpoint not available"
}
```

**Frontend Response**: Show generic error, revert to last successful state, disable selector temporarily.

#### 400 Bad Request

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid page or size parameter"
}
```

**Frontend Response**: Show error, revert pagination to last successful values. Log error for debugging.

#### 500 Server Error

```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to fetch tickets"
}
```

**Frontend Response**: Show user-friendly error, keep last known data, allow retry.

---

## 4. Integration: Component to Service to API

### End-to-End Request Flow

```
1. User clicks page size "10" in MatPaginator
   ├─ Component Event: pageSizeChange event fired
   │  └─ PageEvent { pageSize: 10, pageIndex: 0, ... }
   │
2. Component calls: stateService.updatePageSize(10)
   ├─ State Service processes:
   │  ├─ Reset pageIndex to 0
   │  ├─ Set isLoading = true
   │  ├─ Set attemptedPageSize = 10
   │  └─ Emit state update
   │
3. Component reacts to state change:
   ├─ MatPaginator.pageSize = 10
   ├─ MatPaginator.pageIndex = 0
   ├─ MatPaginator.disabled = true (during loading)
   ├─ Show loading indicator
   │
4. API Service internally called:
   ├─ Fetch: GET /api/v1/tickets/all?page=0&size=10
   │  └─ Authorization header added by interceptor
   │
5. Backend responds (200 OK):
   ├─ items: [ Ticket1, Ticket2, ..., Ticket10 ]
   ├─ page: 0
   ├─ size: 10
   ├─ total: 247
   ├─ totalPages: 25
   │
6. State Service processes response:
   ├─ ValidationPassed
   ├─ Update all pagination fields
   ├─ Set isLoading = false
   ├─ Clear error and attemptedPageSize
   ├─ Emit final state
   │
7. Component updates:
   ├─ MatPaginator.disabled = false
   ├─ Table rows updated (1-10)
   ├─ Pagination info: "1-10 of 247"
   ├─ Hide loading indicator
```

### Error Flow

```
If API call fails (e.g., network timeout):

1. API Service catches error
   │
2. State Service processes error:
   ├─ Set isLoading = false
   ├─ Set error = { type: 'NETWORK', ... }
   ├─ Revert pageSize to previous value
   ├─ Revert pageIndex to previous value
   ├─ Clear attemptedPageSize
   ├─ Emit error state
   │
3. Component updates:
   ├─ MatPaginator shows previous size again
   ├─ Show error message to user
   ├─ Table shows last successful data (no change)
   ├─ MatPaginator.disabled = false (user can retry)
```

---

## 5. Testing Checklist

### Unit Test Examples

#### Test: Page Size Change State Transitions
```typescript
it('should reset page index when page size changes', () => {
  const state = new TicketsStateService(...);
  state.setPagination({ pageIndex: 2, pageSize: 20, ... });
  
  state.updatePageSize(10);
  // Assert: pageIndex was reset to 0
  state.state$.subscribe(st => {
    expect(st.pagination.pageIndex).toBe(0);
    expect(st.pagination.pageSize).toBe(10);
    expect(st.isLoading).toBe(true);
  });
});
```

#### Test: API Request Parameters
```typescript
it('should send correct query parameters to backend', () => {
  const service = new TicketsApiService(http);
  spyOn(http, 'get');
  
  service.getTickets({ page: 0, size: 10 });
  // Assert: HTTP call includes ?page=0&size=10
  expect(http.get).toHaveBeenCalledWith(
    'http://localhost:8080/api/v1/tickets/all',
    jasmine.objectContaining({
      params: new HttpParams()
        .set('page', '0')
        .set('size', '10')
    })
  );
});
```

### Integration Test Examples

#### Test: Full Page Size Change Flow
```typescript
it('should complete full page size change flow: user click -> API -> table update', (done) => {
  // 1. Setup mock data
  const mockResponse = {
    items: [/* 10 tickets */],
    page: 0,
    size: 10,
    total: 247,
    totalPages: 25
  };
  
  // 2. Spy on HTTP
  spyOn(http, 'get').and.returnValue(of(mockResponse));
  
  // 3. Trigger page size change (simulates user click)
  const state = new TicketsStateService(api);
  state.updatePageSize(10);
  
  // 4. Assert final state matches expected
  state.state$.subscribe(st => {
    expect(st.pagination.pageSize).toBe(10);
    expect(st.pagination.pageIndex).toBe(0);
    expect(st.items.length).toBe(10);
    expect(st.isLoading).toBe(false);
    done();
  });
});
```

### Manual Testing Checklist

- [ ] Change page size from 20 to 10, verify selector shows "10"
- [ ] Wait for table to load, verify 10 items displayed (or fewer if total < 10)
- [ ] Change to "50", verify table shows ~50 items, selector shows "50"
- [ ] Navigate to page 2, then change page size, verify reset to page 1
- [ ] Disconnect network, change page size, verify error message shows
- [ ] Reconnect, try again, verify success
- [ ] Rapidly click different page sizes, verify only last selection is active
- [ ] Verify other filters (priority, status) still work with new page sizes

---

## 6. Contract Versioning

**Current Version**: 1.0.0  
**Date**: 2026-05-02  
**Backward Compatibility**: N/A (new feature)  
**Breaking Changes**: None expected

### Future Versions

If the backend changes the response format or adds new pagination options:
1. Update this contract document
2. Add version number (e.g., 1.1.0)
3. Document backward compatibility handling
4. Update tests to cover both versions

---

**Status**: Ready for implementation  
**Reviewed By**: [Pending]  
**Approved By**: [Pending]

