# Quickstart: Page Size Selector Fix

**Feature**: 003-fix-page-size-selector  
**Date**: 2026-05-02  

## Quick Summary

The page size selector in the tickets dashboard is broken. This guide explains what the fix does and how to test it.

---

## Problem Description

**Before Fix**: When you click the page size selector (10, 20, 50 items per page) in the tickets dashboard:
- The table might not update to show the right number of items
- The selector might revert back to the previous value after you change it
- You can't tell if your action worked or not

**After Fix**: When you click the page size selector:
- The selector immediately shows your choice (visual feedback)
- The table reloads from the backend with the correct number of items
- If something goes wrong, you see a clear error message
- Clicking on a different page size again works correctly every time

---

## What Gets Fixed

### ✅ Feature 1: Selector Stays at Your Choice
- User selects "10 items per page"
- Screen shows "10" selected immediately (visual feedback)
- Table loads data for 10 items per page
- Once done, the selector still shows "10" (no revert)

### ✅ Feature 2: Table Updates with Correct Data
- The backend is asked for data with the new page size
- The table shows exactly that many items (or fewer if not enough exist)
- Example: Select 50 → table shows 1-50 tickets (if 50+ exist)

### ✅ Feature 3: No Lost State
- If you're on page 3 with 10 items per page
- You switch to 50 items per page
- The system resets to page 1 (because page 3 with 50 items might not exist)
- This prevents confusing states

### ✅ Feature 4: Error Handling
- If the API request fails, you see a message
- The selector shows what you tried to select
- You can retry by clicking the selector again
- The table isn't broken; you can still navigate

---

## How to Test

### Manual Test 1: Basic Page Size Change
1. Go to Tickets Dashboard (URL: `/tickets`)
2. Verify you see ~20 tickets per page (default)
3. Click the page size selector (bottom right of table, says "20")
4. Select "10"
   - ✅ Selector should immediately show "10"
   - ✅ Table should show ~10 items
   - ✅ No revert to "20"
5. Click selector again, choose "50"
   - ✅ Selector shows "50"
   - ✅ Table shows ~50 items (or all if fewer exist)
   - ✅ No visual revert

### Manual Test 2: Error Handling
1. (Optional) Disconnect network or mock an API error
2. Go to Tickets Dashboard, select a different page size
3. Wait for the error message to appear
   - ✅ Selector should show the size you tried to select
   - ✅ Error message visible (don't hide the selector behind error)
   - ✅ Table shows last successful data or empty state
4. Fix the network issue, try again
   - ✅ Selector works on retry

### Manual Test 3: Rapid Changes
1. Go to Tickets Dashboard
2. Quickly click page size selector 3 times: "10" → "50" → "20"
3. Wait for data to load
   - ✅ Only the last selection ("20") should be in effect
   - ✅ Table shows ~20 items
   - ✅ No duplicate or conflicting data

### Manual Test 4: Multi-Page Navigation
1. Go to Tickets Dashboard
2. Use pagination to go to page 3
3. Change page size from 20 to 50
   - ✅ System resets to page 1 (because page 3 with 50 items might not exist)
   - ✅ Selector shows "50"
   - ✅ Table shows items 1-50
4. Change page size to 10
   - ✅ System resets to page 1
   - ✅ Selector shows "10"

---

## Technical Details

### What Code Changes

**Service Layer** (`tickets-state.service.ts`):
- New method: `onPageSizeChange(newSize: number)`
- Logic: Resets page to 0, triggers API call with new size

**Component Layer** (`tickets-list-page.component.ts`):
- Event listener for MatPaginator's `pageSizeChange` event
- Calls the service method when size changes

**No Changes Needed**:
- Backend API (already supports `page` and `size` parameters)
- Data models (no new fields)
- Other components (isolated fix)

### API Parameters Sent

When page size changes from 20 to 10:

```
Before Fix:
  GET /api/v1/tickets/all?page=2&size=20
  (wrong: page & size mismatched)

After Fix:
  GET /api/v1/tickets/all?page=0&size=10
  (correct: reset to page 1, use new size)
```

### Expected Response

```json
{
  "items": [
    { "id": 1, "title": "Ticket 1", ... },
    { "id": 2, "title": "Ticket 2", ... },
    ...
    { "id": 10, "title": "Ticket 10", ... }
  ],
  "page": 0,
  "size": 10,
  "total": 247,
  "totalPages": 25
}
```

The table then shows exactly 10 tickets, and the selector shows "10".

---

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| Total tickets (100) < selected size (50) | Show all 100, pages=2, selector="50" ✅ |
| Zero tickets exist | Show empty state, selector works for future data ✅ |
| User on page 5, switches size | Reset to page 1, not page 5 ✅ |
| API times out | Show error, selector shows attempted size, user can retry ✅ |
| User clicks size selector 5 times fast | Only the last click's request is sent ✅ |

---

## Acceptance Criteria

- ✅ Selector shows the selected value immediately (no revert)
- ✅ Table updates with correct number of items
- ✅ Page resets to 1 when size changes (no orphaned pages)
- ✅ Error message shown if API fails (don't hide selector)
- ✅ Rapid changes handled correctly (last click wins)
- ✅ Works with all options: 10, 20, 50 items per page
- ✅ No impact on other filters (priority, status, etc.)
- ✅ No breaking changes to existing tests

---

## Related Documentation

- **Full Specification**: See `spec.md`
- **Data Model**: See `data-model.md`
- **API Contract**: See `contracts/pagination-api.md`
- **Implementation Tasks**: See `tasks.md` (created by /speckit.tasks command)

---

**Last Updated**: 2026-05-02  
**Status**: Ready for implementation

