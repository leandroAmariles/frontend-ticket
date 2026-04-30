# API Contract: Backend Endpoints

**Feature**: consume-backend-api  
**Version**: 1.1 (Updated with actual backend endpoints)  
**Date**: 2026-04-30  
**Backend Base URL**: `http://localhost:8080` (development)

## Overview

This document defines the HTTP contract between the frontend and backend based on actual endpoint specifications from the backend. Frontend developers use this to understand:
- Exact request/response formats from real backend
- Authentication token format and usage
- Ticket data structure and fields
- Error codes and messages
- Header requirements

---

## Authentication Endpoint

### POST /api/auth/login

**Purpose**: Authenticate user and receive JWT access token

**Endpoint**: `http://localhost:8080/api/auth/login`

#### Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin_password"
}
```

**Request Fields:**
- `username`: String (required) - Username/login identifier
- `password`: String (required) - User password

#### Success Response (200 OK)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NzU2Mzk3NCwiZXhwIjoxNzc3NTY3NTc0LCJyb2xlIjoiQURNSU4ifQ.UuuLhjCJlOz214PIUiDCxzLmIB1PZKXRQ_eRCAfNuGU",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "username": "admin",
  "issuedAt": 1777563974
}
```

**Response Fields:**
- `accessToken`: String - JWT token (use in Authorization header as `Bearer <accessToken>`)
- `tokenType`: String - Always "Bearer"
- `expiresIn`: Number - Token lifetime in seconds (3600 = 1 hour)
- `username`: String - Authenticated username
- `issuedAt`: Number - Unix timestamp (seconds) when token was issued

**Token Payload (decoded JWT):**
```
{
  "sub": "admin",
  "userId": 2,
  "username": "admin",
  "iat": 1777563974,
  "exp": 1777567574,
  "role": "ADMIN"
}
```

#### Failure Response (401 Unauthorized)

```json
{
  "error": "Invalid credentials"
}
```

#### Other Errors

| Status | Reason | Response |
|--------|--------|----------|
| 400 Bad Request | Missing username or password | `{ "error": "Missing required fields" }` |
| 429 Too Many Requests | Rate limit exceeded | `{ "error": "Too many login attempts" }` |
| 500 Internal Server Error | Server failure | `{ "error": "Internal server error" }` |

#### Frontend Handling

```typescript
// Request
this.http.post<LoginResponse>('/api/auth/login', { username, password })

// Store token
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('tokenType', response.tokenType);

// Use in subsequent requests:
// Authorization: Bearer <accessToken>

// 401 response → redirect to login page, clear stored token
// 400 response → display "Invalid username or password"
// 5xx response → display "Server error. Please try again."
```

---

## Tickets Endpoint

### GET /api/v1/tickets/all

**Purpose**: Fetch all tickets accessible to the authenticated user (paginated)

**Endpoint**: `http://localhost:8080/api/v1/tickets/all`

#### Request

```http
GET /api/v1/tickets/all
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NzU2Mzk3NCwiZXhwIjoxNzc3NTY3NTc0LCJyb2xlIjoiQURNSU4ifQ.UuuLhjCJlOz214PIUiDCxzLmIB1PZKXRQ_eRCAfNuGU
Content-Type: application/json
```

**Required Headers:**
- `Authorization: Bearer <accessToken>` — JWT token from /api/auth/login response

**Query Parameters (optional):**
- `page`: Number (0-indexed) — Page number (default: 0)
- `size`: Number — Items per page (default: 20)
- `sort`: String — Sorting field and direction (e.g., "createdAt,desc")

#### Success Response (200 OK)

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "titulo": "Error en el login",
      "descripcion": "Los usuarios no pueden iniciar sesión con Google OAuth",
      "status": "PENDING",
      "creatorId": "user_001",
      "fecha": "2026-04-28T14:30:00Z",
      "createdAt": "2026-04-29T17:24:23Z",
      "updatedAt": "2026-04-29T17:24:23Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "titulo": "Mejorar rendimiento de búsqueda",
      "descripcion": "La búsqueda es lenta cuando hay muchos registros",
      "status": "PENDING",
      "creatorId": "user_002",
      "fecha": "2026-04-28T15:45:00Z",
      "createdAt": "2026-04-29T17:24:23Z",
      "updatedAt": "2026-04-29T17:24:23Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 11,
  "totalPages": 1
}
```

**Response Structure:**
- `items`: Array of Ticket objects
- `page`: Number - Current page index (0-based)
- `size`: Number - Items per page in this response
- `total`: Number - Total count of all tickets in system
- `totalPages`: Number - Total number of pages available

**Ticket Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique ticket identifier |
| `titulo` | string | Yes | Ticket title (max ~200 chars) |
| `descripcion` | string | No | Detailed description |
| `status` | enum | Yes | One of: `PENDING`, `CREATED` |
| `creatorId` | string | Yes | ID of user who created ticket |
| `fecha` | string (ISO 8601) | Yes | User-provided date for the ticket |
| `createdAt` | string (ISO 8601) | Yes | System creation timestamp |
| `updatedAt` | string (ISO 8601) | Yes | Last update timestamp |

**Status Values:**
- `PENDING` — Ticket is pending/open
- `CREATED` — Ticket has been created/processed

#### Failure Response (401 Unauthorized)

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Action**: Clear stored token, redirect user to login page.

#### Failure Response (403 Forbidden)

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to view tickets"
}
```

**Action**: Display error message; suggest contacting support.

#### Failure Response (500 Internal Server Error)

```json
{
  "error": "Internal server error",
  "message": "Failed to fetch tickets"
}
```

**Action**: Display "Server error" message; provide retry button.

#### Frontend Handling

```typescript
// Request
this.http.get<TicketsResponse>('/api/v1/tickets/all', {
  headers: { Authorization: `Bearer ${accessToken}` }
})

// Expected structure:
// TicketsResponse {
//   items: Ticket[];
//   page: number;
//   size: number;
//   total: number;
//   totalPages: number;
// }

// 200 response → parse items, apply transformations, display in table
// 401 response → clear token, redirect to login
// 403 response → display "Permission denied" error
// 5xx response → display "Server error" with retry button
```

---

## Data Models

### Ticket

```typescript
interface Ticket {
  id: string;                         // UUID (e.g., "550e8400-e29b-41d4-a716-446655440001")
  titulo: string;                     // Title (non-empty, max ~200 chars)
  descripcion?: string;               // Optional description (max ~2000 chars)
  status: 'PENDING' | 'CREATED';      // Ticket status
  creatorId: string;                  // ID of creator user
  fecha: string;                      // ISO 8601 user-provided date (e.g., "2026-04-28T14:30:00Z")
  createdAt: string;                  // ISO 8601 system creation timestamp
  updatedAt: string;                  // ISO 8601 last update timestamp
}
```

### LoginResponse

```typescript
interface LoginResponse {
  accessToken: string;                // JWT token
  tokenType: string;                  // Always "Bearer"
  expiresIn: number;                  // Token lifetime in seconds
  username: string;                   // Username of authenticated user
  issuedAt: number;                   // Unix timestamp (seconds) when issued
}
```

### TicketsResponse

```typescript
interface TicketsResponse {
  items: Ticket[];                    // Array of tickets
  page: number;                       // Current page (0-indexed)
  size: number;                       // Items in this response
  total: number;                      // Total tickets in system
  totalPages: number;                 // Total number of pages
}
```

### API Error Response

```typescript
interface ErrorResponse {
  error: string;                      // Machine-readable error code
  message?: string;                   // Human-readable error message
}
```

---

## Security Requirements

1. **Token Format**: JWT (JSON Web Token)
   - Include `exp` (expiration time) claim
   - Token expires in 3600 seconds (1 hour) by default
   - Contains user identity and role information

2. **HTTPS**: Must use HTTPS in production
   - Development can use HTTP (http://localhost:8080)
   - Tokens must be transmitted over secure connections

3. **Authorization Header Format**:
   - `Authorization: Bearer <accessToken>`
   - No other header formats are supported

4. **Token Storage**:
   - Store in localStorage or secure storage
   - Token should be sent with every API request
   - Token must be cleared on logout or 401 response

5. **Token Expiration**:
   - After token expires (based on `expiresIn`), user must re-authenticate
   - Frontend can:
     - Check token expiration before requests (optional optimization)
     - Or let 401 responses trigger re-authentication (simpler)

---

## Error Handling Standard

All error responses follow this structure:

```json
{
  "error": "ErrorCode",               // Machine-readable error code
  "message": "Human readable text"    // Optional user-friendly message
}
```

### Common HTTP Status Codes

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 200 | Success | Parse and display data |
| 400 | Bad Request | Display error; check request format |
| 401 | Unauthorized | Clear token; redirect to login |
| 403 | Forbidden | Display "Access denied" message |
| 404 | Not Found | Display "Resource not found" |
| 500 | Server Error | Display "Server error" with retry button |
| 503 | Service Unavailable | Display "Service temporarily unavailable" |

---

## Testing Contract

### Manual Testing Checklist

- [ ] `POST /api/auth/login` with valid credentials returns accessToken
- [ ] `POST /api/auth/login` with invalid credentials returns 401
- [ ] `GET /api/v1/tickets/all` without Authorization header returns 401
- [ ] `GET /api/v1/tickets/all` with valid token returns array of tickets in `items` field
- [ ] Each ticket has all required fields: `id`, `titulo`, `status`, `createdAt`, `updatedAt`
- [ ] Response includes pagination metadata: `page`, `size`, `total`, `totalPages`
- [ ] Empty ticket list returns `items: []` (valid response, not error)
- [ ] Expired token returns 401
- [ ] Invalid token format returns 401

### cURL Examples

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin_password"}'

# Extract accessToken from response, e.g. TOKEN="eyJhbGc..."

# Fetch tickets with token
curl -X GET "http://localhost:8080/api/v1/tickets/all" \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "http://localhost:8080/api/v1/tickets/all?page=0&size=50" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Versioning & Changes

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-04-30 | Updated with actual backend endpoints and response formats |
| 1.0 | 2026-04-30 | Initial contract definition (generic) |

## Contact

**Backend API Owner**: [Backend Team Contact]  
**Frontend Implementation Lead**: [Frontend Team Contact]  
**Last Updated**: 2026-04-30
