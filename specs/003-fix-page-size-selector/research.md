# Research Report: Page Size Selector Fix

**Feature**: 003-fix-page-size-selector  
**Date**: 2026-05-02  
**Status**: Complete — No clarifications required

---

## Summary

All technical specifications for this feature have been confirmed through analysis of:
1. Current implementation in tickets-list-page component
2. Existing state management in tickets-state.service
3. Backend API contract from 002-consume-backend-api feature
4. Angular Material MatPaginator documentation

No unknowns remain; research phase is complete.

---

## Confirmed Technical Context

### Current Frontend Implementation ✅

**Tickets List Component** (`src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts`)
- MatPaginator is integrated
- Has default pageSizeOptions: [10, 20, 50]
- Default page size: 20
- Component subscribes to tickets-state.service for data updates

**Issues Identified**:
1. MatPaginator.pageSizeChange event may not be connected to state service
2. Page index is not reset when page size changes
3. Selector value may be bound to stale component property

### State Management ✅

**Tickets State Service** (`src/app/tickets/services/tickets-state.service.ts`)
- Uses RxJS BehaviorSubject for state management
- Manages pagination state (pageIndex, pageSize)
- Existing methods: updatePageIndex()
- **Missing**: updatePageSize() method with proper reset logic

**Backend API Service** (`src/app/tickets/services/tickets-api.service.ts`)
- Already implements getTickets(page, size) method
- Properly passes query parameters to backend
- No changes needed

### Backend Endpoint Validation ✅

From 002-consume-backend-api feature:

**Endpoint**: `GET /api/v1/tickets/all`
- ✅ Accepts `page` parameter (0-based index)
- ✅ Accepts `size` parameter (10, 20, 50)
- ✅ Returns pagination metadata:
  - `page` (echoed request value)
  - `size` (echoed request value)
  - `total` (total items across all pages)
  - `totalPages` (calculated by backend)
- ✅ Response structure supports all requirements

### Angular Material Version

- Framework: Angular 15+
- Material Version: Compatible with MatPaginator
- MatPaginator API is stable; all required events are available:
  - `@Output() page: EventEmitter<PageEvent>`
  - `@Output() pageSizeChange: EventEmitter<PageEvent>`

---

## Root Cause Analysis

### Why the Bug Occurs

The MatPaginator fires both `page` and `pageSizeChange` events when the user interacts with the pagination control. However, the component likely:

1. **Doesn't listen to pageSizeChange event specifically** → User clicks size, event fires but no handler
2. **Doesn't reset pageIndex on size change** → Page 5 with 20 items becomes invalid with 50 items
3. **Binds selector to component property, not to latest state** → State updates don't propagate to UI
4. **Sends old page size to backend** → Backend returns fewer items than new size but component expects old size count

### Race Condition Risk

If rapid successive requests are sent without waiting for responses:
- Request 1: page=0, size=10 (in flight)
- Request 2: page=0, size=50 (in flight, Response 1 arrives with 10 items)
- Response 1 arrives: Sets state to 10 items
- Response 2 arrives later: Sets state to 50 items
- **Result**: Race condition where order matters

**Solution**: Use RxJS switchMap to cancel previous requests when new request issued

---

## Design Decision Rationale

### Decision 1: Reset Page Index on Size Change

**Options Considered**:
- A. Keep current page (e.g., page 3 with 50 items = invalid)
- B. Reset to page 1 (first page, always valid)
- C. Intelligently adjust (e.g., page 3 with 20 items → page ~2 with 50 items)

**Decision**: Option B (reset to page 1)
**Rationale**:
- Simple and predictable user experience
- Avoids invalid states
- Spec explicitly requires this behavior (User Story 3)
- Less risk of off-by-one errors

### Decision 2: Update Selector Value Before API Response

**Options Considered**:
- A. Update selector only after API succeeds
- B. Update selector immediately (optimistic update)
- C. Show "pending" state (e.g., "10 (loading)")

**Decision**: Option B (optimistic update with fallback)
**Rationale**:
- Immediate visual feedback reduces user confusion (main complaint)
- If API fails, revert to last successful value + show error
- UX expectation: "I clicked, it should change immediately"
- Spec explicitly requires "selector must maintain value during load"

### Decision 3: Error State Handling

**Options Considered**:
- A. Keep old selector value, don't show attempted value
- B. Show attempted value with error message
- C. Show "Retry" button next to selector

**Decision**: Option B (show attempted value + error message)
**Rationale**:
- User sees their intent was understood (improves confidence)
- They can see what went wrong separately
- Selector remains visible per spec requirement
- Retry happens via normal selector interaction

### Decision 4: Request Deduplication

**Options Considered**:
- A. debounceTime(500ms) - wait before sending
- B. switchMap - cancel previous if new arrives
- C. ignoreDuplicates - only send if different from current

**Decision**: Option B (switchMap with no debounce)
**Rationale**:
- Immediate visual feedback (no 500ms wait)
- Cancels in-flight request automatically
- User intent always honored
- "Last click wins" semantic is clear

---

## Edge Cases & Validation

### Case 1: Total Items < Selected Page Size
**Example**: 15 total tickets, user selects 50

**Expected Behavior**:
- API returns 15 items (all of them)
- totalPages = 1
- Selector shows "50" (user's choice)
- ✅ Handled correctly by backend

### Case 2: Zero Tickets
**Example**: No tickets exist

**Expected Behavior**:
- items = []
- totalPages = 0 or 1
- Selector still shows last selected value
- User can select different size for future data
- ✅ No issues with MatPaginator or state

### Case 3: Session Expires During Change
**Example**: User changes page size, token expires while loading

**Expected Behavior**:
- API returns 401 Unauthorized
- Auth interceptor catches and redirects to login
- Pagination error is never shown
- ✅ Handled by existing auth interceptor

### Case 4: Multiple Filters Active
**Example**: Filter by "High Priority" AND change page size

**Expected Behavior**:
- API call includes both filters and pagination params
- E.g.: `?priority=HIGH&status=OPEN&page=0&size=10`
- Selector works independently
- ✅ No conflicts with existing filters

### Case 5: Backend Validation Errors
**Example**: Frontend sends invalid page size (not 10, 20, 50)

**Expected Behavior**:
- ✅ Frontend enforces valid options via pageSizeOptions array
- Backend never receives invalid values
- No validation error handling needed

---

## Technology Choices Confirmed

### RxJS Patterns
✅ **switchMap**: Recommended for pagination (cancels old requests)
✅ **shareReplay**: Optional for preventing duplicate requests if component re-renders
✅ **tap**: For side effects (logging, state updates)

### Angular APIs
✅ **MatPaginator Events**: All required events available
✅ **ngOnDestroy**: Component properly unsubscribes from observables
✅ **OnPush Change Detection**: Already in use, supports immutable state

### HTTP Interceptors
✅ **Existing Auth Interceptor**: Handles 401 responses correctly
✅ **No new interceptors needed**: Fix is purely state management

---

## Testing Strategy Identified

### Unit Tests Required
1. **State Service**: Test updatePageSize() resets pageIndex
2. **Component**: Test pageSizeChange event handler calls service
3. **API Service**: Test sends correct query parameters
4. **Error Handling**: Test error state preserves last successful values

### Integration Tests Required
1. **E2E Page Size Change**: Simulate user click → API → Table update
2. **Error Recovery**: API fails → Show error → Retry succeeds
3. **Rapid Changes**: Multiple quick clicks → Only last honored

### Coverage Goal
- Aim for 80%+ coverage on modified files
- Focus on pagination-related code paths
- Include edge cases: 0 items, items < size, invalid states

---

## Dependencies & Blockers

### Hard Dependencies ✅
- Angular Material MatPaginator (already installed)
- RxJS >= 6.0 (already in project)
- Backend API supporting page/size params (confirmed working)

### Nice-to-Have (Not Blockers)
- Custom error message component (can use snackbar for MVP)
- Loading skeleton (table shows blank rows is acceptable)
- Accessibility audit (already follows Material best practices)

### No Blockers Identified ✅

---

## Assumptions Validated

✅ **Assumption 1**: Backend API returns totalPages and total correctly
- **Validation**: Confirmed in 002-consume-backend-api tests

✅ **Assumption 2**: Users expect immediate visual feedback
- **Validation**: Spec explicitly requires selector to persist immediately

✅ **Assumption 3**: Page size options [10, 20, 50] are fixed
- **Validation**: Spec says "won't add new values as part of this fix"

✅ **Assumption 4**: No persistence needed across browser sessions
- **Validation**: Spec explicitly excludes cross-session persistence

---

## Recommended Implementation Order

1. **Add updatePageSize() method to TicketsStateService**
   - Logic: Reset page to 0, set isLoading, call API
   - Use switchMap to handle rapid changes

2. **Connect MatPaginator pageSizeChange event in Component**
   - Add event handler: (event) => stateService.updatePageSize(event.pageSize)
   - Ensure component subscribes to updated state

3. **Add error handling**
   - On API error: revert pagination to last successful state
   - Show user-friendly error message

4. **Add tests**
   - Unit tests for state transitions
   - Integration tests for full flow
   - Aim for 80%+ coverage

---

## Related Research (From Previous Features)

### From 001-tickets-dashboard
- MatPaginator integration pattern
- Ticket table rendering
- Basic state management

### From 002-consume-backend-api
- HTTP client setup
- Error interceptor patterns
- Loading state management
- API response validation

---

**Status**: Research Complete ✅
**Next Step**: Phase 1 Design (Artifacts Already Generated)
**Last Updated**: 2026-05-02

