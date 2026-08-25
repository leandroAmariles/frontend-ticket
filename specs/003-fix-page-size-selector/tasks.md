# Tasks: Fix Page Size Selector in Tickets Dashboard

**Input**: Design documents from `specs/003-fix-page-size-selector/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/pagination-api.md, quickstart.md

**Organization**: Tasks are organized by user story (P1, P1, P2) to enable independent implementation and testing.

**Constitution Requirement**: TDD is mandatory per constitution. All tasks include test-first approach.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- Checkbox format: `- [ ]` (not checked initially)

---

## Phase 1: Setup (Shared Project Initialization)

**Purpose**: Ensure test infrastructure and base configurations are ready

**⚠️ CRITICAL**: Many of these items may already exist from previous specs. Tasks verify and augment as needed.

- [ ] T001 Verify test infrastructure (Jest, Cypress) is configured in project root
- [ ] T002 Verify tsconfig.json and Angular compiler options support strict mode
- [ ] T003 [P] Verify ESLint/Prettier configuration includes all necessary source files
- [ ] T004 Create pagination models directory structure at `src/app/tickets/models/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until Phase 1 AND Phase 2 are complete

- [ ] T005 Create/verify PaginationState interface in `src/app/tickets/models/pagination.model.ts`
- [ ] T006 Create PageSizeChangeEvent interface in `src/app/tickets/models/pagination.model.ts`
- [ ] T007 Create PaginationError interface in `src/app/tickets/models/pagination.model.ts`
- [ ] T008 Extend TicketsListState with pagination properties in `src/app/tickets/models/tickets-list-state.model.ts`
- [ ] T009 Verify RxJS observables and switchMap pattern available in dependencies

**Checkpoint**: Foundation complete - User Story implementation can now begin

---

## Phase 3: User Story 1 - Page Size Change Updates Table (Priority: P1) 🎯 MVP

**Goal**: Ensure that when user selects a new page size, the table updates with correct data from backend

**Independent Test**: Load dashboard → change page size to 10 → verify ~10 items displayed and selector shows "10"

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL before implementation) ⚠️

- [ ] T010 [P] [US1] Create unit test: page size change resets page index in `src/app/tickets/__tests__/unit/tickets-state.spec.ts`
  - Test: `updatePageSize(10)` sets pageIndex to 0 and pageSize to 10
  - Assert: state emits { pageIndex: 0, pageSize: 10, isLoading: true }
  
- [ ] T011 [P] [US1] Create unit test: API request includes correct size parameter in `src/app/tickets/__tests__/unit/tickets-api.spec.ts`
  - Test: `getTickets({ page: 0, size: 10 })` sends request with ?page=0&size=10
  - Assert: HttpClient called with correct query params
  
- [ ] T012 [P] [US1] Create component unit test: pageSizeChange event handler in `src/app/tickets/__tests__/unit/tickets-list-page.spec.ts`
  - Test: MatPaginator.pageSizeChange(10) calls stateService.updatePageSize(10)
  - Assert: Service method invoked with correct value
  
- [ ] T013 [US1] Create integration test: full page size change flow in `src/app/tickets/__tests__/integration/page-size-change.spec.ts`
  - Test: User clicks size 10 → API call sent → response received → table updates
  - Scenario: 100 tickets, change size 20→10, verify 10 items shown

### Implementation for User Story 1

- [ ] T014 [US1] Implement `updatePageSize(newSize: number)` method in `src/app/tickets/services/tickets-state.service.ts`
  - Logic: Reset pageIndex to 0, set isLoading=true, set attemptedPageSize, emit state, trigger API call
  - Use switchMap to handle rapid changes (cancel previous requests)
  - Include error handling: on failure, revert to last successful state

- [ ] T015 [US1] Connect MatPaginator pageSizeChange event in `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts`
  - Add event handler: `onPageSizeChange(event: PageEvent)`
  - Call: `this.stateService.updatePageSize(event.pageSize)`
  - Ensure subscription to state$ updates paginator bindings
  
- [ ] T016 [US1] Bind pageSizeChange event in template: `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.html`
  - Add MatPaginator binding: `(pageSizeChange)="onPageSizeChange($event)"`
  - Ensure [pageSize] binding reflects current state.pageSize
  - Add loading indicator with *ngIf="state.isLoading"
  
- [ ] T017 [US1] Update TicketsApiService to validate page size parameter in `src/app/tickets/services/tickets-api.service.ts`
  - Add validation: pageSize must be in [10, 20, 50]
  - Reject or default invalid values (silent or error per error handling strategy)
  
- [ ] T018 [US1] Add response validation in TicketsApiService `src/app/tickets/services/tickets-api.service.ts`
  - Verify: response.items.length <= response.size
  - Verify: response.size matches requested size
  - Verify: response.total >= 0, response.totalPages >= 0
  - On validation failure: throw descriptive error

**Checkpoint**: User Story 1 complete and independently testable

---

## Phase 4: User Story 2 - Selector Maintains Value During Load (Priority: P1)

**Goal**: Selector visually shows user's choice immediately; shows attempted value if error occurs

**Independent Test**: Change page size → observe loading state → verify selector shows new value (even before data arrives) → verify persists after load

### Tests for User Story 2 (TDD - Write FIRST, ensure FAIL before implementation) ⚠️

- [ ] T019 [P] [US2] Create unit test: attempted page size tracking in `src/app/tickets/__tests__/unit/tickets-state.spec.ts`
  - Test: `updatePageSize(50)` immediately sets attemptedPageSize=50 in state
  - Assert: state.attemptedPageSize emitted before API response arrives
  
- [ ] T020 [P] [US2] Create component test: selector binding reflects attemptedPageSize in `src/app/tickets/__tests__/unit/tickets-list-page.spec.ts`
  - Test: state.attemptedPageSize = 50 → MatPaginator.pageSize displays as 50
  - Assert: UI shows user's intent immediately (no waiting for API)
  
- [ ] T021 [US2] Create error scenario integration test in `src/app/tickets/__tests__/integration/page-size-change.spec.ts`
  - Test: Change size → API returns 500 error → selector shows attempted size + error message
  - Scenario: User clicked "50", error occurs, verify selector still shows "50", not reverted to "20"

### Implementation for User Story 2

- [ ] T022 [US2] Extend state emission logic to show attemptedPageSize in `src/app/tickets/services/tickets-state.service.ts`
  - Modify updatePageSize(): emit state with attemptedPageSize=newSize immediately (optimistic update)
  - On API success: clear attemptedPageSize, set pageSize to final value
  - On API error: keep attemptedPageSize visible, revert pageSize to last successful value
  
- [ ] T023 [US2] Update component template to bind attemptedPageSize in `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.html`
  - Bind MatPaginator: `[pageSize]="state.attemptedPageSize || state.pagination.pageSize"`
  - Bind disabled state: `[disabled]="state.isLoading"` (optional: prevents new clicks during load)
  
- [ ] T024 [US2] Implement error message display in `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts` or template
  - Show error message if state.error is not null
  - Include: error.type, error.message, error.statusCode (if applicable)
  - Auto-dismiss after 5 seconds OR provide explicit close button
  - Use snackbar or toast (Material MatSnackBar recommended)
  
- [ ] T025 [US2] Add loading state visual feedback in `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.html`
  - Show spinner/skeleton while isLoading=true
  - Keep MatPaginator visible but optionally disabled
  - Display "Loading..." or similar near pagination controls

**Checkpoint**: User Stories 1 AND 2 complete; selector persists value even during load

---

## Phase 5: User Story 3 - Reset to First Page on Size Change (Priority: P2)

**Goal**: When page size changes, redirect user to page 1 to avoid invalid page states

**Independent Test**: Navigate to page 3 with 20 items/page → change size to 50 → verify redirected to page 1 with 50 items shown

### Tests for User Story 3 (TDD - Write FIRST, ensure FAIL before implementation) ⚠️

- [ ] T026 [P] [US3] Create unit test: page index reset on size change in `src/app/tickets/__tests__/unit/tickets-state.spec.ts`
  - Test: pageIndex=2, then updatePageSize(50) → pageIndex reset to 0
  - Assert: state emits { pageIndex: 0, pageSize: 50 }
  
- [ ] T027 [P] [US3] Create component test: navigation reflects reset page index in `src/app/tickets/__tests__/unit/tickets-list-page.spec.ts`
  - Test: MatPaginator.pageIndex=2 → pageSizeChange event → pageIndex binding becomes 0
  - Assert: MatPaginator resets to page 1 (0-indexed as page 0)
  
- [ ] T028 [US3] Create integration test: multi-page navigation with size change in `src/app/tickets/__tests__/integration/page-size-change.spec.ts`
  - Test: Navigate pages (1→2→3) → change size → verify page 1 reached and correct data displayed
  - Scenario: 100 tickets, page 3 of 20/page → change to 50/page → verify 1-50 shown

### Implementation for User Story 3

- [ ] T029 [US3] Ensure pageIndex reset logic in updatePageSize() in `src/app/tickets/services/tickets-state.service.ts`
  - Verify updatePageSize() already resets pageIndex to 0 (should be from US1 T014)
  - Add comment explaining why reset is needed (avoid invalid states)
  
- [ ] T030 [US3] Add validation: prevent invalid pageIndex values in `src/app/tickets/services/tickets-state.service.ts`
  - Add method: `validatePageIndex(index: number, totalPages: number): number`
  - Logic: if index >= totalPages, reset to 0
  - Call this in API response handler to ensure coherent state
  
- [ ] T031 [US3] Update component pageIndex binding to react to state changes in `src/app/tickets/pages/tickets-list-page/tickets-list-page.component.ts`
  - Ensure MatPaginator [pageIndex] binding updates when state.pageIndex changes
  - Component must set MatPaginator.pageIndex = 0 when size changes
  
- [ ] T032 [US3] Test edge case: page 1 with size change in `src/app/tickets/__tests__/integration/page-size-change.spec.ts`
  - Test: pageIndex=0 (page 1) → change size → verify stays at page 0 and data updates
  - Scenario: Ensure no unnecessary navigation when already on page 1

**Checkpoint**: All user stories (1, 2, 3) complete; pagination coherent in all scenarios

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements, tests, documentation, and final validation

- [ ] T033 [P] Run existing test suite to verify no regressions in `npm test` or `Jest`
  - Ensure all unit tests pass
  - Verify code coverage >= 80% on modified files
  - Check that existing tests for other components still pass
  
- [ ] T034 [P] Add additional edge case unit tests in `src/app/tickets/__tests__/unit/`
  - Test: 0 tickets (empty state)
  - Test: <10 tickets with 50/page selected
  - Test: Rapid succession of size changes (switchMap behavior)
  - Test: Session timeout during size change (401 Unauthorized)
  
- [ ] T035 [P] Add e2e tests using Cypress in `cypress/e2e/page-size-selector.spec.ts`
  - Test: User journey from login → page size change → table update
  - Test: Error recovery (network failure → retry → success)
  - Test: Accessibility (tab navigation, aria labels)
  
- [ ] T036 [US1] [US2] [US3] Run through quickstart.md manual testing checklist
  - Verify all 4 manual test scenarios pass
  - Verify all edge cases work correctly
  - Verify error messages are user-friendly
  
- [ ] T037 Documentation: Add code comments explaining pagination state management in key files
  - `tickets-state.service.ts`: updatePageSize() logic and error handling
  - `tickets-list-page.component.ts`: event handler and binding strategy
  - `pagination.model.ts`: Interface documentation with examples
  
- [ ] T038 Performance verification: Measure page size change performance
  - Verify UI updates in <200ms (excluding network latency)
  - Verify no unnecessary re-renders (check performance profiler)
  - Verify switchMap correctly cancels old requests
  
- [ ] T039 Accessibility verification:
  - Verify MatPaginator has correct ARIA labels
  - Verify error messages are screen-reader friendly
  - Verify loading states have aria-busy attribute
  - Test keyboard navigation (Tab, Enter, Arrow keys)
  
- [ ] T040 [P] Run final code review checklist
  - Ensure all code follows ESLint/Prettier rules
  - Verify no console.errors or warnings in browser
  - Verify no memory leaks (use Angular Profiler)
  
- [ ] T041 Update project documentation
  - Add section to README about pagination feature
  - Document the fix in CHANGELOG.md
  - Update API contract documentation if needed
  
- [ ] T042 Verify TypeScript strict mode compliance
  - No `any` types without justification
  - All optional properties properly typed
  - Error handling typed correctly

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓ (must complete before)
Phase 2: Foundational (Core models & infrastructure)
    ↓ (must complete before)
Phase 3: User Story 1 (P1 - Page size change updates table)
    ↓ (can run in parallel)
Phase 4: User Story 2 (P1 - Selector maintains value)
    ↓ (can run in parallel or sequentially)
Phase 5: User Story 3 (P2 - Reset to first page)
    ↓ (must complete before)
Phase 6: Polish & Cross-Cutting Concerns
```

### User Story Dependencies

| User Story | Priority | Can Start After | Dependencies | Status |
|-----------|----------|-----------------|--------------|--------|
| US1: Page Size Change | P1 | Phase 2 Complete | None | MVP |
| US2: Selector Value Persistence | P1 | Phase 2 Complete | Can parallel with US1 | MVP |
| US3: Reset to First Page | P2 | Phase 2 Complete | Can parallel with US1/US2 | Nice-to-have |

### Within Each User Story

**Execution order per story**:
1. Tests (T010-T013, T019-T021, T026-T028) - Write FIRST, ensure FAIL
2. Models/Data structures (included in Foundational)
3. Service implementation (T014, T022, T029)
4. Component event handling (T015, T023, T031)
5. Component template binding (T016, T024, T032)
6. API validation (T017, T018)
7. Integration tests → run to verify pass

### Parallel Opportunities

**Phase 1** - All [P] tasks can run simultaneously:
- T003: ESLint/Prettier (different config files)

**Phase 2** - All [P] tasks run in parallel (different model files):
- T005, T006, T007: Create model interfaces

**Phase 3 (US1)** - Tests [P] run in parallel before implementation:
- T010, T011, T012: 3 different test files
- Then T014: Service (depends on models from Phase 2)
- Then T015, T016: Component (depends on T014)
- Then T017, T018: API (depends on service)

**Phase 4 (US2)** - Can start immediately after Phase 2 (parallel to US1):
- T019, T020: Tests in parallel
- Then T022, T023, T024, T025: Implementation (can run after T014 complete)

**Phase 5 (US3)** - Can start immediately after Phase 2 (parallel to US1/US2):
- T026, T027: Tests in parallel
- Then T029, T030, T031, T032: Implementation

**Phase 6** - After any user story completes:
- T033, T034, T035, T040: Tests in parallel (different files)
- T036: Manual testing (after implementation of respective stories)

### Example: 1-2 Developer Sequential Timeline

```
Day 1:
  - Complete Phase 1 (Setup)
  - Complete Phase 2 (Foundational)

Day 2:
  - User Story 1 tests (T010-T013) - ensure FAIL first
  - Implement US1 (T014-T018)
  - Run tests - verify PASS
  
Day 3:
  - User Story 2 tests (T019-T021) - ensure FAIL first
  - Implement US2 (T022-T025)
  - Run tests - verify PASS
  
Day 4:
  - User Story 3 tests (T026-T028) - ensure FAIL first
  - Implement US3 (T029-T032)
  - Run tests - verify PASS
  
Day 5:
  - Polish & validation (Phase 6)
  - Manual testing (T036)
  - Final checks & documentation (T037-T042)
  - Deploy or demo
```

### Example: 3 Developer Parallel Timeline

```
Team Setup (Day 1):
  - All developers: Complete Phase 1 + Phase 2 together

Developer A (Days 2-3):
  - US1 tests (T010-T013)
  - US1 implementation (T014-T018)
  - Integrate US1

Developer B (Days 2-3):
  - US2 tests (T019-T021)
  - US2 implementation (T022-T025 - can start after T014)
  - Integrate US2

Developer C (Days 2-3):
  - US3 tests (T026-T028)
  - US3 implementation (T029-T032 - can start after T014)
  - Integrate US3

Team (Day 4):
  - All: Polish & validation (T033-T042)
  - All: Merge and test integration
  - All: Deploy or demo
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product = US1 + US2)

**Timeline**: 2-3 days with 1 developer

1. Complete Phase 1: Setup (1 hour)
2. Complete Phase 2: Foundational (1-2 hours)
3. Complete Phase 3: User Story 1 (4-6 hours)
   - Tests first → implement → verify
4. Complete Phase 4: User Story 2 (3-4 hours)
   - Tests first → implement → verify
5. Basic polish from Phase 6 (2-3 hours)
   - Run test suite, verify coverage
   - Manual testing per quickstart.md
6. **Stop and Deploy** - MVP Ready! ✅

Users can now change page size and selector persists value. Core fix delivered.

### Full Feature Delivery (All Stories + Polish)

**Timeline**: 4-5 days with 1 developer, or 3-4 days with 3 developers

Follow phases 1-6 sequentially (or with parallel team as shown in examples above).

### Incremental Delivery (Recommended)

1. Phases 1-2 + US1 + US2 → Deploy MVP (page size works + selector persists)
2. Wait for feedback → then add US3 (reset to page 1)
3. Then add Phase 6 (polish, e2e tests, optimization)

Each increment is independently testable and deployable.

---

## Success Criteria (Acceptance)

✅ **User Story 1** complete when:
- Changing page size updates table with correct number of items
- Selector shows selected value
- API receives correct page & size parameters
- Verified by T010, T011, T012, T013 tests passing

✅ **User Story 2** complete when:
- Selector shows attempted value immediately (no waiting)
- Selector persists through loading state
- On error: selector shows attempted value + error message displayed
- Verified by T019, T020, T021 tests passing

✅ **User Story 3** complete when:
- Changing page size resets to page 1
- Page 1 with size change stays on page 1
- No orphaned/invalid page states
- Verified by T026, T027, T028 tests passing

✅ **MVP Ready** when: US1 + US2 + basic Phase 6 complete
✅ **Feature Complete** when: All 3 stories + Phase 6 complete with >80% coverage

---

## Testing Requirements (TDD Mandated by Constitution)

**Phase 3 (US1)**: 4 test tasks (T010-T013)
- Ensure tests FAIL before implementing
- Test should verify: state changes, API params, event handling, integration flow

**Phase 4 (US2)**: 3 test tasks (T019-T021)
- Ensure tests FAIL before implementing
- Test should verify: optimistic updates, error state, selector binding

**Phase 5 (US3)**: 3 test tasks (T026-T028)
- Ensure tests FAIL before implementing
- Test should verify: page reset logic, edge cases, navigation

**Phase 6**: Additional tests for edge cases, e2e with Cypress, accessibility

**Coverage Goal**: >= 80% on modified files per Constitution VI

---

## Notes & Best Practices

- **[P] marker**: Only used when tasks target different files with no inter-task dependencies
- **[Story] label**: Required for all Phase 3-5 tasks to map to user stories
- **TDD approach**: Write tests first, ensure they FAIL, then implement until PASS
- **Independent testing**: Each user story should be testable on its own (not dependent on other stories)
- **Commit strategy**: Commit after each task or logical group (e.g., after all tests for a story pass)
- **Checkpoint validation**: Stop at each checkpoint to manually verify story works before proceeding
- **Code review**: Every task output should pass ESLint, TypeScript strict mode, and have adequate test coverage

---

**Generated**: 2026-05-02  
**Feature**: 003-fix-page-size-selector  
**Status**: Ready for Implementation  
**Total Tasks**: 42 (Setup: 4, Foundational: 5, US1: 9, US2: 7, US3: 8, Polish: 10)

