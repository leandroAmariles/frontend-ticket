# Research Report: Backend API Integration — Consume Tickets Endpoint

**Feature**: consume-backend-api  
**Date**: 2026-04-30  
**Status**: Complete — No clarifications required

## Summary

All technical specifications for this feature have been confirmed through actual backend endpoint documentation provided by the development team. No unknowns remain; research phase is complete.

## Confirmed Technical Specifications

### Backend Endpoints

✅ **Authentication Endpoint**
- **URL**: `POST http://localhost:8080/api/auth/login`
- **Status**: Confirmed working
- **Request**: `{ username: string, password: string }`
- **Response**: `{ accessToken, tokenType: "Bearer", expiresIn: 3600, username, issuedAt }`
- **Token Format**: JWT with fields: `sub`, `userId`, `username`, `iat`, `exp`, `role`

✅ **Tickets Endpoint**
- **URL**: `GET http://localhost:8080/api/v1/tickets/all`
- **Status**: Confirmed working
- **Headers Required**: `Authorization: Bearer <accessToken>`
- **Query Parameters**: `page` (0-indexed), `size` (default 20), `sort` (optional)
- **Response Structure**: 
  ```json
  {
    "items": [...],
    "page": 0,
    "size": 20,
    "total": 11,
    "totalPages": 1
  }
  ```

### Ticket Data Structure (Actual)

**Confirmed Fields from Backend**:
- `id`: UUID string (e.g., "550e8400-e29b-41d4-a716-446655440001")
- `titulo`: String (not "title") — ticket title
- `descripcion`: Optional string (not "description") — ticket description
- `status`: Enum ("PENDING" | "CREATED") — **not** "low"/"medium"/"high" or "open"/"in_progress"/"closed"
- `creatorId`: String — ID of user who created ticket
- `fecha`: ISO 8601 string — user-provided ticket date
- `createdAt`: ISO 8601 string — system creation timestamp
- `updatedAt`: ISO 8601 string — last modification timestamp

**Key Differences from Initial Specification**:
1. Field names use Spanish: `titulo`, `descripcion` (vs. expected `title`, `description`)
2. Status values are `PENDING` | `CREATED` (vs. initially assumed `open`|`in_progress`|`closed`)
3. No "priority" field in API response (initially assumed)
4. No "assigned_to" fields (initially assumed)
5. Includes custom `fecha` field (user date, distinct from `createdAt`)
6. Response wrapped in `items` array (vs. initially assumed `data` array)
7. Pagination uses `page`, `size`, `total`, `totalPages` (vs. initially assumed `limit`, `pages`)

## Design Decisions

### 1. API Response Parsing Strategy

**Decision**: Map backend response field names to frontend model properties as-is initially; add transformation layer if needed.

**Rationale**: 
- Maintain 1:1 mapping with backend to minimize bugs
- Use Spanish field names in API contracts; translation can happen in UI display layer
- Document differences clearly in API contract for developer reference

**Implementation**:
```typescript
interface Ticket {
  id: string;
  titulo: string;        // Spanish field name from API
  descripcion?: string;
  status: 'PENDING' | 'CREATED';
  creatorId: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Token Storage Mechanism

**Decision**: Use `localStorage` for development; production should upgrade to HttpOnly cookies.

**Alternatives Considered**:
- ✅ localStorage: Simple to implement, immediate MVP
- ❌ In-memory only: Lost on page refresh
- ❌ sessionStorage: Cleared on tab close
- ⚠️ Cookies with HttpOnly flag: More secure but requires backend cooperation

**Rationale**: MVP fastest path; production roadmap includes secure cookie implementation.

### 3. Handling 401 Unauthorized

**Decision**: Reactive approach — let interceptor catch 401, clear token, redirect to login.

**Alternatives Considered**:
- ✅ Reactive (current decision): Simpler, handles all expiration/revocation scenarios
- ❌ Proactive validation: Check exp claim before each request
- ❌ Refresh token strategy: Requires backend refresh endpoint (out of scope)

**Rationale**: Simpler, more reliable, handles edge cases (revoked tokens, clock skew).

### 4. Pagination Architecture

**Decision**: Support pagination in API layer; defer UI pagination controls to next iteration.

**Why**: 
- Backend already provides pagination metadata (`page`, `size`, `total`, `totalPages`)
- Foundation laid for future filtering/sorting features
- Single-page load for MVP is acceptable

### 5. Error Handling Approach

**Decision**: Delegate to existing `ErrorHandlerService`; show user-friendly messages with retry capability.

**Strategy**:
- 401/403: Redirect to login or show permission error
- 4xx: Show user-friendly error message
- 5xx: Show "Server error" with Retry button
- Network errors: Show "Connection failed" with Retry button

## Best Practices Applied

### TypeScript Interfaces

✅ **Strong Typing**: Interfaces include JSDoc comments for clarity
```typescript
interface Ticket {
  id: string;           // UUID from backend
  titulo: string;       // Non-empty string
  // ...
}
```

### HTTP Interceptor Pattern

✅ **Centralized Token Injection**: Single point of concern
✅ **Error Response Handling**: 401 automatically triggers re-auth

### Testing Strategy

✅ **Contract Tests**: Validate actual API responses
✅ **Unit Tests**: Service methods in isolation
✅ **Integration Tests**: End-to-end flows (login → fetch)
✅ **E2E Tests**: Real user scenarios

## Architectural Decisions

### Service Layer

```
Components
    ↓ (call)
TicketsApiService (fetch)
    ↓ (uses)
HttpClient + AuthInterceptor
    ↓ (adds header)
AuthService (get token)
    ↓ (from)
localStorage
    ↓ (to)
Backend API
```

**Rationale**: 
- Separation of concerns (service ≠ component)
- Reusable across components
- Testable in isolation
- Interceptor handles cross-cutting concerns

### State Management

```
TicketsStateService
    ├── tickets$: Observable<Ticket[]>
    ├── loading$: Observable<boolean>
    └── error$: Observable<string | null>
```

**Rationale**: Single source of truth; components subscribe to state, don't manage separately.

## Security Considerations

### Token Storage

⚠️ **Current (MVP)**: localStorage
- Vulnerability: XSS can steal token
- Mitigation: Content Security Policy (CSP) headers, sanitize user inputs

✅ **Recommended (Production)**: HttpOnly + Secure + SameSite cookies
- Prevents XSS token theft
- Automatic inclusion in requests
- Requires backend support

### Authorization Header

✅ **Format**: `Authorization: Bearer <accessToken>`
- Follows OAuth2 standard conventions
- Backend validates JWT signature and expiration

### HTTPS Enforcement

⚠️ **Development**: HTTP allowed (localhost:8080)
✅ **Production**: HTTPS enforced; browser will block mixed content

## Performance Insights

### API Response Times

**Confirmed Baseline**:
- Endpoint availability: ✅ Confirmed working
- Expected response time: ~200-500ms (typical for paginated endpoint)
- No caching configured (fresh data per request)

**Optimization Opportunities** (future iterations):
- Implement HTTP cache directives (Cache-Control, ETag)
- Add response compression (gzip)
- Skeleton loaders for perceived performance

## Testing Approach

### Unit Tests
- AuthService token methods
- Interceptor header injection
- TicketsApiService error handling
- Response transformation logic

### Integration Tests
- Login → Token storage → API call flow
- Error propagation through interceptor
- 401 response triggers re-login

### Contract Tests
- API response structure matches expectations
- Token format matches JWT spec
- Pagination metadata is correct

### E2E Tests
- User login scenario
- Dashboard load displays tickets
- Retry on network failure
- Logout clears session

## Dependencies Validation

✅ **Angular HttpClient**: Standard library, no additional install needed
✅ **RxJS**: Standard in Angular projects
✅ **Backend API**: Confirmed available at `http://localhost:8080/api/`
✅ **Error Handler Service**: Existing (`src/app/core/services/error-handler.service.ts`)

## Risks & Mitigation

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|-----------|
| 1 | Backend API endpoint changes | Low | High | API contract document; coordinate with backend team |
| 2 | Token expiration during request | Low | Medium | Implement token refresh in next iteration |
| 3 | localStorage XSS vulnerability | Medium | High | Implement CSP; upgrade to HttpOnly cookies for production |
| 4 | Slow network causes UX degradation | Medium | Medium | Skeleton loaders; request timeout settings |
| 5 | CORS policy blocks requests | Low | Critical | Verify backend allows frontend origin; test locally first |

## Conclusion

✅ **All specifications confirmed and documented**

No clarifications needed. Backend endpoints, response formats, and security requirements are clearly defined. Ready to proceed to task breakdown and implementation.

**Next Phase**: Generate tasks.md for dependency-ordered breakdown of implementation work.


