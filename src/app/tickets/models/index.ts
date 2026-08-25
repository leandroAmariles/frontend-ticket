/**
 * Ticket entity interface — matches actual backend response from GET /api/v1/tickets/all
 */
export interface Ticket {
  id: string;               // UUID v4
  titulo: string;
  descripcion: string;
  status: 'PENDING' | 'CREATED';
  creatorId: string | null; // nullable in backend
  ticketType?: string;      // e.g. "TAREA", "INCIDENCIA"
  severity?: string;        // e.g. "low", "medium", "high"
  priority?: string;
  fecha: string;            // ISO-8601
  createdAt: string;        // ISO 8601 UTC
  updatedAt?: string;       // ISO 8601 UTC
}

/**
 * Pagination metadata from API responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * GET /api/v1/tickets/all API response structure
 */
export interface TicketsResponse {
  items: Ticket[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/**
 * GET /api/v1/tickets/all API request parameters
 */
export interface TicketsListParams {
  page?: number;
  size?: number;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * User entity interface
 */
export interface User {
  id: string;
  name: string;
  role?: string;
}

/**
 * POST /api/tickets API request payload
 */
export interface CreateTicketPayload {
  fecha: string;       // ISO-8601 with timezone
  titulo: string;      // 1–250 characters
  descripcion: string; // 1+ characters
}

/**
 * POST /api/tickets API response (202 ACCEPTED)
 */
export interface CreateTicketResponse {
  messageId: string;
  status: string;
  timestamp: number;
}

// Pagination models (Feature 003: fix-page-size-selector)
export {
  PaginationState,
  PageSizeChangeEvent,
  PaginationError,
  TicketsListStateExtended,
} from './pagination.model';
