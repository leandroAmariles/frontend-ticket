/**
 * Ticket entity interface
 * Represents a support ticket in the backend system
 * Mapped to actual backend fields: id, titulo, descripcion, status, creatorId, fecha, createdAt, updatedAt
 */
export interface Ticket {
  id: string; // UUID v4
  titulo: string; // Backend field name (Spanish: title)
  descripcion: string; // Backend field name (Spanish: description)
  status: 'PENDING' | 'CREATED'; // Backend ticket status values
  creatorId: string; // UUID v4 of ticket creator
  fecha: string; // Ticket date field
  createdAt: string; // ISO 8601 UTC format - Creation timestamp
  updatedAt: string; // ISO 8601 UTC format - Last update timestamp
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
  page?: number; // Default: 0
  size?: number; // Default: 20
  sort?: string; // Optional sorting
}

/**
 * User entity interface
 * Represents a system user who can create and manage tickets
 */
export interface User {
  id: string;
  name: string;
  role?: string;
}

/**
 * Post /tickets API request payload
 */
export interface CreateTicketPayload {
  titulo: string;
  descripcion: string;
  status: 'PENDING' | 'CREATED';
}

/**
 * Re-query configuration for tracking newly created tickets
 */
export interface ReQueryConfig {
  initialInterval: number; // milliseconds
  maxInterval: number; // milliseconds
  maxDuration: number; // milliseconds
  backoffMultiplier?: number;
}

