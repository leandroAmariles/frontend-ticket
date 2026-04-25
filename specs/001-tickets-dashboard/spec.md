# Specification: Tickets Dashboard — Filters: Deploy Available Values

Short name: deploy-filter-values

Summary

Ensure the dashboard filters deploy (display and populate) the available filter values for ticket lists. Filter controls (priority, status, assignee and other configurable fields) must show the correct and current set of selectable values so users can reliably narrow results. Values should be sourced from the backend or derived from the dataset, cached reasonably for responsiveness, localized for presentation, and resilient when values are missing or very large in cardinality.

## Clarifications

### Session 2026-04-25

- Q: What is the primary source of filter values? → A: Use dedicated backend filter-values endpoint (primary source).

Actors

- Agent / Authenticated user: views and manages tickets.
- Reader: a user who only views tickets.

Scope

Includes:

- Populate filter controls with available values for fields used in filtering (e.g., priority, status, assignee).
- Dynamic refresh of filter values on page load and on explicit refresh action; cache for short duration to improve perceived performance.
- Display an "All" option to clear a filter and graceful handling when there are no available values for a filter (disabled state or "No values" message).
- Localize display labels for filter values while preserving canonical internal values.

Excludes:

- Full faceted search or free-text search (out of scope).
- Backend changes; assume the backend can provide required data or the frontend can derive values from the returned ticket set.

Functional requirements

FR-1: Dynamic population of filter values

- Filter controls must populate their option lists from a reliable source on initial page load: either a dedicated backend filter-values resource or by inspecting the current ticket page set when a dedicated endpoint is not available.
- Filter controls must populate their option lists primarily from a dedicated backend filter-values resource (preferred). If a dedicated endpoint is not available, the frontend MAY derive values by inspecting the current ticket page set as a documented fallback; note limitations where server-side aggregation differs across pages.
- Acceptance test: When the dashboard loads, each filter control shows options corresponding to the current available values within 500 ms of the UI becoming interactive (excluding network latency allowances for slow links; see assumptions).

FR-2: Caching and refresh

- The UI must cache fetched filter values for a short duration (e.g., during the session) and provide a visible "Refresh filters" control to retrieve updated values on demand.
- Acceptance test: After a simulated backend change to filter values, using "Refresh filters" updates the options within 2 seconds.

FR-3: Localization and label mapping

- Filter option labels must be localized in the UI; internal canonical values remain unchanged when submitting filters to the backend.
- Acceptance test: For a known canonical value (e.g., "low"), the UI shows a localized label (e.g., "Low") and sending the filter keeps the canonical value.

FR-4: Large cardinality handling

- If a filter would show a very large number of options (e.g., >100), present a sensible UX (searchable dropdown, grouped options, or limit with "Show more") to avoid overwhelming the user.
- Acceptance test: When 250 distinct assignees exist, the assignee filter shows a searchable selector or an initial subset with a clear action to load more.

FR-5: Empty or missing values

- If no values are available for a filter, show a disabled control with a "No values" message and ensure applying such filter is not possible.
- Acceptance test: When backend returns no statuses, the status filter is disabled and shows "No values".

FR-6: Consistency with pagination and server-side filtering

- Applying a filter must result in a request that yields a coherent filtered dataset consistent with pagination controls. If the frontend derives values locally, document limitations where server-side aggregation would differ across pages.
- Acceptance test: Applying a filter reduces visible items and pagination updates to the correct page counts for the returned dataset.

FR-7: Loading indicators and accessibility

- Show clear loading indicators for filters while values are being fetched; controls must remain accessible (keyboard focusable, ARIA attributes).
- Acceptance test: When filter values are loading, a visible spinner/skeleton for the control is present and controls are reachable by keyboard.

User scenarios (Acceptance Scenarios)

Scenario 1: Dashboard shows dynamic filter values

- Given an authenticated agent on the tickets dashboard
- When the page loads
- Then the filter controls populate with the available values and are usable within 500 ms of the page becoming interactive

Scenario 2: User filters by a dynamically loaded value

- Given filters are populated
- When the user selects a value in priority and applies it
- Then the ticket list updates showing only tickets with that priority and pagination reflects the filtered result set

Scenario 3: Refresh filter values after backend change

- Given the filter values were cached in the session
- When the user clicks "Refresh filters" after a backend change
- Then the filter lists update to include new values within 2 seconds

Scenario 4: No values available for a filter

- Given the backend returns no values for a field
- When the dashboard renders
- Then the corresponding filter is disabled and displays "No values" (localized)

Success criteria (measurable)

1. Filter availability latency: 90% of page loads display populated filter controls within 500 ms of UI interactivity.
2. Refresh responsiveness: After a backend change, refreshed filter lists update within 2 seconds in 95% of test runs.
3. Accuracy: Applying any filter reduces the visible results correctly in 100% of acceptance tests (matching expected dataset subsets).
4. Usability with large sets: For filters with >100 options, 95% of users can find and select an option within 15 seconds using searchable or grouped selectors in usability tests.
5. Accessibility: Filter controls meet basic a11y checks (keyboard focusable, ARIA labels) in automated accessibility audits.

Key entities

- Ticket: { id, title, priority, status, assigned_to_id, assigned_to_name, created_at }
- FilterValue: { field: string, value: string (canonical), label: string (localized), count?: number }
- User: { id, name, role }

Assumptions

- The backend can provide either a dedicated source of filter values or the frontend can reliably derive values from listed tickets for common fields.
- Canonical values are used internally and are stable (e.g., priority: "low"/"medium"/"high"). The UI is responsible for localization of labels.
- Network performance for typical users is acceptable; tests account for slower connections when measuring latencies.
- The feature is UI-only; backend changes are out of scope for this ticket.

Dependencies

- Backend support for returning tickets and, optionally, an endpoint or metadata for available filter values.
- Shared UI components for dropdowns/selectors and i18n utilities.

Testing and verification

- Manual acceptance: verify filters populate, filtering updates list and pagination, refresh updates values after backend changes.
- Usability tests for large-cardinality filters (searchable selector effectiveness).
- Accessibility checks for keyboard navigation and ARIA support.

Edge cases

- Values with identical display labels but different canonical values: show disambiguation (e.g., append id hint) or prevent duplicates in the selector.
- Rapid backend changes: ensure cache invalidation and user feedback when refresh fails.

Status: READY FOR PLANNING

---

Generated/updated by /speckit.specify

