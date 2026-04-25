/**
 * Ticket entity interface
 * Represents a support ticket in the system
 */
export interface Ticket {
  id: string; // UUID v4
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  assigned_to_id?: string | null; // UUID v4 of assigned user
  assigned_to_name?: string | null; // Display name of assigned user
  created_at: string; // ISO 8601 UTC format
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
 * Pagination metadata from API responses
 */
export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Get /tickets API response structure
 */
export interface TicketsListResponse {
  data: Ticket[];
  meta: PaginationMeta;
}

/**
 * Get /tickets API request parameters
 */
export interface TicketsListParams {
  page?: number;
  page_size?: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'open' | 'in_progress' | 'closed';
  sort?: string; // Format: <field>:<direction> e.g., "created_at:desc"
}

/**
 * Post /tickets API request payload
 */
export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  assigned_to_id?: string | null;
  assigned_to_name?: string | null;
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

