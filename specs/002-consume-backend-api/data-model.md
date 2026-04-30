# Data Model: Backend API Integration

**Feature**: consume-backend-api  
**Version**: 1.0  
**Date**: 2026-04-30

## Overview

This document defines the data structures and TypeScript interfaces used in the feature. These models are used internally by the frontend and must map correctly to the backend API contract.

---

## Core Models

### Ticket

Represents a single ticket in the system.

```typescript
interface Ticket {
  id: string;                         // UUID (e.g., "550e8400-e29b-41d4-a716-446655440001")
  titulo: string;                     // Ticket title (non-empty, max ~200 characters)
  descripcion?: string;               // Optional; ticket description (max ~2000 characters)
  status: 'PENDING' | 'CREATED';      // Ticket workflow status
  creatorId: string;                  // ID of user who created the ticket
  fecha: string;                      // ISO 8601 user-provided date (e.g., "2026-04-28T14:30:00Z")
  createdAt: string;                  // ISO 8601 UTC timestamp - system creation timestamp
  updatedAt: string;                  // ISO 8601 UTC timestamp - last update timestamp
}
```

**Usage in Frontend:**
- Displayed in `TicketsTableComponent` rows
- Used in state management (`TicketsStateService`)
- Passed to child components like `TicketRowComponent`

**Validation Rules:**
- `id`: Non-empty UUID string
- `titulo`: Non-empty, max 200 chars
- `descripcion`: Optional, max 2000 chars
- `status`: Must be 'PENDING' or 'CREATED'
- `creatorId`: Non-empty string
- `fecha`: Valid ISO 8601 timestamp
- `createdAt` and `updatedAt`: Valid ISO 8601 timestamps

**Example:**
```typescript
const ticket: Ticket = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  titulo: 'Error en el login',
  descripcion: 'Los usuarios no pueden iniciar sesión con Google OAuth',
  status: 'PENDING',
  creatorId: 'user_001',
  fecha: '2026-04-28T14:30:00Z',
  createdAt: '2026-04-29T17:24:23Z',
  updatedAt: '2026-04-29T17:24:23Z'
};
```

---

### LoginResponse

Represents the response from the authentication endpoint.

```typescript
interface LoginResponse {
  accessToken: string;                // JWT token string
  tokenType: string;                  // Always "Bearer"
  expiresIn: number;                  // Token lifetime in seconds (e.g., 3600 = 1 hour)
  username: string;                   // Username of authenticated user
  issuedAt: number;                   // Unix timestamp (seconds) when token was issued
}
```

**Usage in Frontend:**
- Received from `POST /api/auth/login` endpoint
- `accessToken` is stored and used for subsequent API requests
- `expiresIn` can be used to calculate token expiration time

**Example:**
```typescript
const loginResponse: LoginResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJJZCI6MiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NzU2Mzk3NCwiZXhwIjoxNzc3NTY3NTc0LCJyb2xlIjoiQURNSU4ifQ.UuuLhjCJlOz214PIUiDCxzLmIB1PZKXRQ_eRCAfNuGU',
  tokenType: 'Bearer',
  expiresIn: 3600,
  username: 'admin',
  issuedAt: 1777563974
};
```

---

### TicketsResponse

API response structure for the `GET /api/v1/tickets/all` endpoint.

```typescript
interface TicketsResponse {
  items: Ticket[];                    // Array of ticket objects
  page: number;                       // Current page index (0-based)
  size: number;                       // Number of items in current response
  total: number;                      // Total count of all tickets in system
  totalPages: number;                 // Total number of pages available
}
```

**Usage in Frontend:**
- Returned from `GET /api/v1/tickets/all` endpoint via `TicketsApiService`
- `items` array contains the actual ticket data
- Pagination metadata (`page`, `size`, `total`, `totalPages`) used for pagination controls

**Example:**
```typescript
const response: TicketsResponse = {
  items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      titulo: 'Error en el login',
      descripcion: 'Los usuarios no pueden iniciar sesión con Google OAuth',
      status: 'PENDING',
      creatorId: 'user_001',
      fecha: '2026-04-28T14:30:00Z',
      createdAt: '2026-04-29T17:24:23Z',
      updatedAt: '2026-04-29T17:24:23Z'
    }
  ],
  page: 0,
  size: 20,
  total: 11,
  totalPages: 1
};
```

