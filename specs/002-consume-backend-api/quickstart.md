# Quick Start: Backend API Integration — Consume Tickets Endpoint with Authentication

## Overview

This feature establishes the HTTP communication layer between the frontend Angular application and the backend API. It covers:
- **Authentication**: Login via backend endpoint and token management
- **API Integration**: Fetch all tickets from `/tickets` endpoint with authentication headers
- **Error Handling**: Graceful failures, retry mechanisms, and user feedback
- **Data Display**: Parse API response and display tickets in the dashboard

## Key Deliverables

1. **Authentication Flow**
   - Capture user credentials (email/password)
   - POST to `/auth/login` or equivalent endpoint
   - Receive and store authentication token securely

2. **HTTP Interceptor**
   - Automatically inject `Authorization: Bearer <token>` header to all requests
   - Handle 401 Unauthorized responses and redirect to login

3. **Tickets Service** (tickets-api.service.ts)
   - METHOD: `getTickets(): Observable<Ticket[]>`
   - Makes GET request to `/tickets` endpoint
   - Handles response parsing and error cases

4. **UI Components**
   - Loading indicator during fetch
   - Ticket table populated with API data
   - Error message with retry button on failure
   - Empty state when no tickets exist

## High-Level Architecture

```
User Login
    ↓
Backend /auth/login
    ↓
Token stored in memory/localStorage
    ↓
HTTP Interceptor adds "Authorization" header
    ↓
GET /tickets
    ↓
Parse response
    ↓
Display in TicketsListPage → TicketsTable
```

## Files to Create/Modify

### New Files
- `src/app/tickets/services/tickets-api.service.ts` — API client for tickets
- `src/app/core/interceptors/auth.interceptor.ts` — Token injection (if not existing)
- `src/app/models/auth.model.ts` — AuthToken, User models

### Modification
- `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts` — Call service, manage loading/error states
- `src/app/tickets/tickets.module.ts` — Register HTTP interceptor provider

## Success Metrics

✓ 100% of API requests include valid authentication headers
✓ Tickets load within 5 seconds (p95)
✓ Graceful error handling with retry capability
✓ Empty state and loading indicators properly displayed

## Next Steps (After Specification Approval)

1. **Research Phase**: Confirm backend API contract (endpoints, request/response schemas)
2. **Design Phase**: Design task breakdown and dependencies
3. **Implementation**: Build services, interceptors, and UI components
4. **Testing**: Unit, integration, and e2e test coverage

## Related Specifications

- **001-tickets-dashboard**: Parent feature for overall dashboard functionality
- **003-tickets-filters** (planned): Dynamic filter values from API

---

For full details, see [spec.md](./spec.md)

