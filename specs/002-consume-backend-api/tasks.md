# Implementation Tasks: Backend API Integration — Consume Tickets Endpoint with Authentication

**Feature**: consume-backend-api  
**Branch**: `002-consume-backend-api`  
**Date**: 2026-04-30  
**Total Tasks**: 48  
**Status**: Ready for Implementation

---

## 📋 EXECUTIVE SUMMARY

**User Stories Identified** (from spec.md):
- US1: User Authentication & Token Management (FR-1, FR-2)
- US2: Token Injection via HTTP Interceptor (FR-8)
- US3: Fetch & Display Tickets (FR-3, FR-4, FR-5)
- US4: Error Handling & Retry (FR-6, FR-7)
- US5: Session Management & 401 Expiration (Session timeout)

**Phase Structure**:
- Phase 1: Setup (Project structure & dependencies)
- Phase 2: US1 — Authentication & Token Storage
- Phase 3: US2 — HTTP Interceptor
- Phase 4: US3 — Fetch Tickets & Loading States
- Phase 5: US4 — Error Handling & Retry
- Phase 6: US5 — Session Expiration & 401 Handling
- Phase 7: Testing & Validation
- Phase 8: Polish & Cross-Cutting Concerns

**Parallel Opportunities**:
- T006-T008: Core models (parallel, no dependencies)
- T012-T014: AuthService unit tests (parallel with AuthService)
- T020-T022: AuthInterceptor unit tests (parallel with AuthInterceptor)
- T033-T035: TicketsApiService unit tests (parallel with service)

---

## 🎯 PHASE 1: SETUP & FOUNDATIONAL

### Project Structure & Configuration

- [x] T001 Create project structure and update `app.module.ts` to include HTTP interceptor providers

- [x] T002 Create `src/app/core/models/` directory and add barrel export file `src/app/core/models/index.ts`

- [x] T003 Create `src/app/tickets/models/` directory and add barrel export file `src/app/tickets/models/index.ts` 

- [x] T004 Update `package.json` with any missing dependencies (if needed) and verify all are installed

### Core Models & Interfaces

- [x] T005 [P] Create `src/app/core/models/auth-token.model.ts` with `AuthToken` interface (accessToken, tokenType, expiresIn, username, issuedAt)

- [x] T006 [P] Create `src/app/core/models/login-request.model.ts` with `LoginRequest` interface (username, password)

- [x] T007 [P] Create `src/app/core/models/login-response.model.ts` with `LoginResponse` interface matching backend response structure

- [x] T008 [P] Create `src/app/tickets/models/ticket.model.ts` with `Ticket` interface mapped to actual backend fields (id, titulo, descripcion, status, creatorId, fecha, createdAt, updatedAt)

- [x] T009 [P] Create `src/app/tickets/models/tickets-response.model.ts` with `TicketsResponse` interface (items, page, size, total, totalPages)

- [x] T010 Update all model barrel exports (`src/app/core/models/index.ts`, `src/app/tickets/models/index.ts`) to include new interfaces

---

## 🔐 PHASE 2: USER STORY 1 — Authentication & Token Storage (FR-1, FR-2)

### Authentication Service

- [x] T011 [US1] Create `src/app/core/services/auth.service.ts` with:
  - `login(username: string, password: string): Observable<AuthToken>` method
  - `logout(): void` method
  - `getToken(): string | null` method
  - `setToken(token: AuthToken): void` method
  - `isTokenValid(): boolean` method
  - Token storage/retrieval using localStorage

- [ ] T012 [P] [US1] Create `src/app/core/services/__tests__/auth.service.spec.ts` with unit tests for AuthService covering:
  - Login success and failure
  - Token storage and retrieval
  - Token expiration validation
  - Logout clears token
  - Test coverage ≥85%

### Authentication Integration into App Module

- [x] T013 [US1] Update `src/app/app.module.ts` to provide `AuthService` as singleton in core module

- [ ] T014 [US1] Verify TicketsModule (lazy-loaded) can be imported without circular dependency issues

### Contract Tests for Login Endpoint

- [ ] T015 [P] [US1] Create `src/app/core/__tests__/contract/login.spec.ts` with contract tests validating:
  - `POST /api/auth/login` request format validation
  - Success response structure matches `LoginResponse` interface
  - Error responses (401, 400, 5xx) handled correctly
  - Token format is valid JWT
  - Response timestamp parsing

**US1 Independent Test Criteria**:
✅ User can login with valid credentials and receive token  
✅ Token is stored securely in localStorage  
✅ Token can be retrieved and validated  
✅ Invalid credentials return 401 error  
✅ API contract matches expected format  

---

## 🔗 PHASE 3: USER STORY 2 — HTTP Interceptor & Header Injection (FR-8)

### Authentication Interceptor

- [x] T016 [US2] Create `src/app/core/interceptors/auth.interceptor.ts` with:
  - Intercept outgoing requests
  - Inject `Authorization: Bearer <token>` header automatically
  - Extract token from `AuthService`
  - Handle 401 Unauthorized responses (redirect to login)
  - Pass through all other responses
  - Clear token on 401 and trigger logout

- [ ] T017 [P] [US2] Create `src/app/core/interceptors/__tests__/auth.interceptor.spec.ts` with unit tests covering:
  - Authorization header is injected on non-401 requests
  - Token is retrieved from AuthService
  - 401 responses trigger logout and redirect
  - Other status codes pass through unchanged
  - Requests without token are also passed through
  - Test coverage ≥85%

### Register Interceptor in App

- [x] T018 [US2] Update `src/app/app.module.ts` to register `AuthInterceptor` as HTTP_INTERCEPTORS provider

- [ ] T019 [US2] Create test in app module to verify interceptor is properly registered (can be added to app.component.spec.ts)

**US2 Independent Test Criteria**:
✅ All outgoing API requests include Authorization header  
✅ 401 responses trigger logout and redirect  
✅ Token is correctly formatted in header  
✅ Non-API requests are not affected  

---

## 📡 PHASE 4: USER STORY 3 — Fetch Tickets & Loading States (FR-3, FR-4, FR-5)

### Tickets API Service

- [x] T020 [US3] Create `src/app/tickets/services/tickets-api.service.ts` with:
  - `getTickets(page?: number, size?: number): Observable<TicketsResponse>` method
  - Call `GET /api/v1/tickets/all` endpoint with proper query params
  - Return transformed Ticket array
  - Handle HTTP errors and delegate to error handler

- [ ] T021 [P] [US3] Create `src/app/tickets/services/__tests__/tickets-api.service.spec.ts` with unit tests covering:
  - `getTickets()` makes correct HTTP request
  - Query parameters are passed correctly
  - Response is parsed and transformed to Ticket[]
  - Error handling (4xx, 5xx, network errors)
  - Loading state transitions
  - Test coverage ≥85%

### Update Tickets State Service

- [x] T022 [US3] Update `src/app/tickets/services/tickets-state.service.ts` to:
  - Inject `TicketsApiService`
  - Add `tickets$: Observable<Ticket[]>` subject
  - Add `loading$: Observable<boolean>` subject
  - Add `error$: Observable<string | null>` subject
  - Implement `loadTickets(page?: number, size?: number): void` method that:
    - Sets loading$ to true
    - Calls TicketsApiService.getTickets()
    - Updates tickets$ on success
    - Updates error$ on failure
    - Sets loading$ to false on completion

- [ ] T023 [P] [US3] Create integration test `src/app/tickets/services/__tests__/tickets-state.service.spec.ts` covering:
  - State transitions (loading → success)
  - Error state management
  - Unsubscribe on destroy (cleanup)
  - Multiple load attempts
  - Test coverage ≥85%

### Update TicketsListPage Component

- [x] T024 [US3] Update `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts` to:
  - Inject `TicketsStateService`
  - Call `loadTickets()` on component init (ngOnInit)
  - Subscribe to `tickets$`, `loading$`, `error$` observables
  - Handle unsubscribe on destroy (use takeUntil pattern)

- [x] T025 [US3] Update `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.html` to:
  - Display loading spinner/skeleton while `loading$ | async` is true
  - Display ticket table when tickets$ has data
  - Display empty state when `(tickets$ | async)?.length === 0` and not loading
  - Bind ticket data to existing `TicketsTableComponent`

- [x] T026 [US3] Update component test `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.spec.ts` to verify:
  - Component initializes and calls loadTickets()
  - Loading state is visible on init
  - Tickets are displayed when data arrives
  - Empty state is shown for empty list (handled by previous feature)
  - Unsubscribe happens on destroy
  - Test coverage ≥80%

### Contract Tests for Tickets Endpoint

- [ ] T027 [P] [US3] Create `src/app/tickets/__tests__/contract/get-tickets.spec.ts` with contract tests:
  - `GET /api/v1/tickets/all` with valid token returns 200
  - Response structure matches `TicketsResponse` interface
  - Each ticket matches `Ticket` interface
  - Pagination metadata is correct
  - Empty list returns `items: []` not null
  - Test with real backend endpoint

**US3 Independent Test Criteria**:
✅ Dashboard loads and displays tickets from API  
✅ Loading indicator is visible during fetch  
✅ Data is correctly parsed and displayed  
✅ API request includes Authorization header  
✅ Pagination metadata is available  

---

## ⚠️ PHASE 5: USER STORY 4 — Error Handling & Retry (FR-6, FR-7)

### Error Display Component/UI

- [ ] T028 [US4] Update `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.html` to:
  - Add error message display section when `error$ | async` has value
  - Display user-friendly error message
  - Include retry button that calls `loadTickets()` again
  - Use Angular Material snackbar/toast for error notifications (optional enhancement)

- [ ] T029 [US4] Add error handling method to `TicketsListPage` component:
  - `onRetry(): void` method that calls `ticketsStateService.loadTickets()`
  - Clears error state when retry is triggered

### Response Validation

- [ ] T030 [US4] Create `src/app/tickets/utils/ticket-validators.ts` with validation functions:
  - `isValidTicket(obj: any): boolean` type guard
  - `validateTicketResponse(response: any): { valid: boolean; errors: string[] }`
  - Validate required fields: id, titulo, status, createdAt, updatedAt

- [ ] T031 [P] [US4] Create `src/app/tickets/utils/__tests__/ticket-validators.spec.ts` with unit tests for:
  - Valid ticket passes validation
  - Missing required fields fails
  - Invalid field types fails
  - Error messages are descriptive
  - Test coverage ≥90%

### Enhanced Error Handling in TicketsApiService

- [ ] T032 [US4] Update `src/app/tickets/services/tickets-api.service.ts` to:
  - Add response validation using validators from T030
  - Throw descriptive error on validation failure
  - Add error transformation to user-friendly messages
  - Implement catchError operator in observable chain
  - Log errors for debugging

- [ ] T033 [P] [US4] Update `src/app/tickets/services/__tests__/tickets-api.service.spec.ts` to add tests for:
  - Malformed response handling
  - Missing required fields handling
  - Error message generation
  - Error propagation to state service

### Error Handler Integration

- [ ] T034 [US4] Update error handler service usage in `TicketsApiService`:
  - Inject existing `ErrorHandlerService` from core
  - Log errors with context {endpoint, timestamp, statusCode}
  - Use error handler for consistent error message formatting

**US4 Independent Test Criteria**:
✅ API errors display user-friendly messages  
✅ Retry button is functional  
✅ Malformed responses are caught before rendering  
✅ Error state can be cleared by retry  
✅ Error logs include sufficient context  

---

## 🔄 PHASE 6: USER STORY 5 — Session Expiration & 401 Handling (FR-8)

### 401 Response Handling in Interceptor (Enhanced)

- [ ] T035 [US5] Update `src/app/core/interceptors/auth.interceptor.ts` to:
  - Catch 401 responses explicitly
  - Clear AuthService token: `authService.logout()`
  - Redirect to login: `router.navigate(['/login'])`
  - Display session expired message to user (via error handler or snackbar)
  - Prevent subsequent requests while redirecting

- [ ] T036 [P] [US5] Update `src/app/core/interceptors/__tests__/auth.interceptor.spec.ts` to test:
  - 401 response triggers logout
  - Token is cleared from localStorage
  - User is redirected to /login
  - No further requests are made after 401

### Session Timeout Handling

- [ ] T037 [US5] Add session validation to `AuthService`:
  - `sessionExpired(): Observable<boolean>` method checking token expiration
  - `getRemainingTime(): number` method returning seconds until expiration
  - Handle clock skew (frontend time vs server time)

- [ ] T038 [P] [US5] Create tests in `src/app/core/services/__tests__/auth.service.spec.ts`:
  - Token expiration is correctly calculated
  - Expired tokens return true from sessionExpired()
  - RemainingTime is accurate
  - Clock skew is handled gracefully

### Test 401 Scenario End-to-End

- [ ] T039 [US5] Create integration test `src/app/tickets/__tests__/integration/auth-401-flow.spec.ts`:
  - Setup: User logged in with valid token
  - Action: Makes API request, backend returns 401
  - Assertion: Interceptor catches 401
  - Assertion: Token is cleared
  - Assertion: User redirected to login
  - Assertion: Dashboard is inaccessible

**US5 Independent Test Criteria**:
✅ 401 responses trigger immediate logout  
✅ Token is cleared from storage  
✅ User is redirected to login page  
✅ Session expiration is detected  
✅ User cannot access dashboard with expired token  

---

## 🧪 PHASE 7: TESTING & VALIDATION

### Unit Test Coverage Validation

- [ ] T040 [P] Run Jest with coverage report for services and interceptors:
  - AuthService: ≥85% coverage
  - TicketsApiService: ≥85% coverage
  - AuthInterceptor: ≥85% coverage
  - All models: ≥90% coverage
  - Overall feature: ≥82% coverage

- [ ] T041 [P] Create missing unit tests if coverage < thresholds:
  - Add edge case tests
  - Add negative scenario tests
  - Add boundary condition tests

### Integration Testing

- [ ] T042 Create integration test suite `src/app/tickets/__tests__/integration/auth-flow.spec.ts`:
  - Full login → token storage → API call flow
  - Interceptor injection verified
  - State service state transitions
  - Component updates triggered by state changes

- [ ] T043 Create integration test `src/app/tickets/__tests__/integration/error-recovery-flow.spec.ts`:
  - Request fails → error displayed → retry succeeds
  - Loading states transition correctly
  - Error state is cleared on retry

### E2E Testing

- [ ] T044 Create E2E test `e2e/src/auth-and-tickets-flow.spec.ts` (Cypress):
  - User navigates to tickets page
  - Not authenticated → should redirect to login or show login form
  - User enters credentials and submits
  - Request to /api/auth/login succeeds
  - Token is stored
  - Dashboard loads with tickets
  - Verify requests in network tab include Authorization header

- [ ] T045 Create E2E test `e2e/src/error-handling-flow.spec.ts`:
  - Simulate API error by network throttling or mock
  - Error message appears
  - Retry button triggers reload
  - Successful retry displays data

### Manual Acceptance Testing

- [ ] T046 Perform manual acceptance testing (documented in test plan):
  - Setup: Backend running on localhost:8080
  - Test 1: Valid login → Token stored → Tickets displayed
  - Test 2: Invalid login → Error message shown
  - Test 3: Network failure → Error → Retry works
  - Test 4: Simulate token expiration → 401 → Redirect to login
  - Test 5: Check DevTools network requests include Authorization header
  - Document results in ACCEPTANCE_TEST_RESULTS.md

---

## ✨ PHASE 8: POLISH & CROSS-CUTTING CONCERNS

### Accessibility & UX

- [ ] T047 [P] Enhance loading and error states for accessibility:
  - Add ARIA labels to loading spinner: `aria-label="Loading tickets..."`
  - Add ARIA live regions for error messages: `role="alert"`
  - Test keyboard navigation for retry button
  - Update error messages for clarity and user guidance
  - Test with screen reader (NVDA or JAWS)

### Documentation & Code Comments

- [ ] T048 [P] Add inline code documentation:
  - JSDoc comments on all public methods
  - Brief explanations for complex logic (token injection, 401 handling)
  - Examples in comments showing usage
  - Link to API contract (contracts/api.md) in relevant services

### Final Verification

- [ ] T049 Verify all tasks completed and tests passing:
  - Jest: All tests passing, coverage ≥82%
  - Cypress: E2E tests passing on real backend
  - Manual: All acceptance criteria met
  - Code: No linting errors
  - Documentation: Up-to-date

- [ ] T050 Update feature status in copilot-instructions.md:
  - Change status from "PLANNING" to "IMPLEMENTATION_COMPLETE"
  - Link to implemented plan/code
  - Document any deviations from original plan

---

## 📊 TASK SUMMARY

| Phase | Count | Focus |
|-------|-------|-------|
| P1: Setup | 10 | Project configuration & core models |
| P2: US1 | 5 | Authentication & token storage |
| P3: US2 | 4 | HTTP interceptor & header injection |
| P4: US3 | 8 | Fetch tickets & loading states |
| P5: US4 | 7 | Error handling & retry |
| P6: US5 | 5 | Session expiration & 401 handling |
| P7: Testing | 7 | Test coverage & validation |
| P8: Polish | 4 | Accessibility & documentation |
| **TOTAL** | **50** | **Complete implementation** |

---

## 🔗 DEPENDENCIES & EXECUTION ORDER

**Critical Path** (must complete in order):
```
T001-T010 (Setup & Models)
  ↓
T011-T014 (AuthService)
  ↓
T016-T018 (AuthInterceptor)
  ↓
T020-T022 (TicketsApiService)
  ↓
T024-T026 (TicketsListPage)
  ↓
T028-T034 (Error Handling)
  ↓
T035-T038 (Session Handling)
  ↓
T041-T050 (Testing & Validation)
```

**Parallel Execution Opportunities**:
- T005-T010: All models (no dependencies)
- T012, T015: Tests can run parallel with implementation
- T021, T023, T031, T033, T038: Tests parallel with services/components
- T027, T039: Contract tests after respective features
- T040, T041, T047, T048: Polish tasks near end, can run in parallel

---

## 🚀 IMPLEMENTATION STRATEGY

### MVP Scope (Essential):
- ✅ T001-T010: Setup
- ✅ T011-T014: AuthService
- ✅ T016-T018: AuthInterceptor
- ✅ T020-T022: TicketsApiService
- ✅ T024-T026: TicketsListPage
- ✅ T028-T032: Basic error handling
- ✅ T041-T045: Core tests
- **Estimated**: ~20-25 hours

### Phase 2 Enhancement (Recommended):
- ✅ T033-T038: Robust error & session handling
- ✅ T046-T050: Full test coverage & polish
- **Estimated**: ~8-10 hours additional

### Nice-to-Have (Future):
- Automatic token refresh
- HttpOnly secure cookies
- Advanced caching strategy
- Real-time notifications

---

## 📋 ACCEPTANCE CRITERIA

**Definition of Done for Each Task**:
- [ ] Code written following project conventions
- [ ] Tests written (if applicable)
- [ ] Tests passing (100% for new code)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Feature branch updated

**Overall Feature Done When**:
- [ ] All 50 tasks completed
- [ ] Coverage ≥82% 
- [ ] All unit/integration/e2e tests passing
- [ ] Manual acceptance testing complete
- [ ] Documentation up-to-date
- [ ] Code review approved
- [ ] Ready for merge to main

---

## 📝 NEXT STEPS

1. ✅ Copy this tasks.md to `specs/002-consume-backend-api/tasks.md`
2. → Begin implementation with Phase 1 (T001-T010)
3. → Mark tasks complete as you progress
4. → Run tests frequently (after each task or at end of phase)
5. → Update progress in this document
6. → Request code review when phase complete
7. → Merge to main once all tasks done

---

**Status**: 🟢 **READY FOR IMPLEMENTATION**

Generated by `/speckit.tasks` workflow  
All dependencies identified and documented  
Parallel execution opportunities noted  

Start with T001 →


