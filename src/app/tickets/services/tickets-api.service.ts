import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';import { catchError, map } from 'rxjs/operators';

import {
  TicketsResponse,
  CreateTicketPayload,
  CreateTicketResponse,
} from '../models';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { validateTicketsArray, formatValidationErrors } from '../utils/ticket-validators';
import { environment } from '../../../environments/environment';

/**
 * Tickets API Service
 * Handles all HTTP communication with the backend tickets API
 *
 * **Purpose**: This service is the single point of contact for all ticket-related API calls.
 * It encapsulates HTTP requests, response validation, error handling, and transformation logic.
 *
 * **Main Endpoint**:
 * - GET `http://localhost:8080/api/v1/tickets/all`
 *   - Query params: `page` (default: 0), `size` (default: 20)
 *   - Response: `{items: Ticket[], page, size, total, totalPages}`
 *
 * **Key Responsibilities**:
 * - Fetch tickets from backend API with pagination support
 * - Validate response structure (items array, pagination metadata)
 * - Validate individual tickets (required fields, correct types)
 * - Transform raw API responses to business models (Ticket interface)
 * - Handle all HTTP error statuses (4xx, 5xx, network errors)
 * - Provide user-friendly error messages (avoid technical jargon)
 * - Log errors with context for debugging (timestamp, status, endpoint)
 * - Support optional parameters (page, size)
 *
 * **Dependencies**:
 * - HttpClient: Make HTTP requests
 * - ErrorHandlerService: Log errors with context
 * - RxJS operators: Transform observables, handle errors
 *
 * **Example Usage**:
 * ```typescript
 * // In a component:
 * constructor(private ticketsApi: TicketsApiService) {}
 *
 * ngOnInit() {
 *   // Fetch first page
 *   this.ticketsApi.getTickets(0, 20).subscribe(
 *     (response) => {
 *       console.log('Tickets:', response.items);
 *       console.log('Total:', response.total);
 *     },
 *     (error) => {
 *       console.error('Failed to load tickets:', error.message);
 *     }
 *   );
 * }
 * ```
 *
 * **Error Handling Strategy**:
 * - 401 Unauthorized: Token expired (handled by interceptor)
 * - 403 Forbidden: User lacks permission
 * - 400 Bad Request: Invalid query parameters
 * - 5xx Server Error: Temporary API issue
 * - Network Error: Connection failure or timeout
 * - Invalid Response: Response doesn't match expected structure
 *
 * **Response Validation**:
 * Two-tier validation ensures data integrity:
 * 1. Structure validation: Check for required fields (items, page, size)
 * 2. Item validation: Check each ticket for required fields (id, titulo, status, etc.)
 * Failures throw descriptive errors that are caught and displayed to user.
 *
 * @service Provided in 'root' to ensure singleton instance
 * @see ErrorHandlerService for centralized error logging
 * @see ticket-validators.ts for validation logic
 */
@Injectable({
  providedIn: 'root',
})
export class TicketsApiService {
  private readonly API_BASE_URL = environment.apiBaseUrl;
  private readonly TICKETS_ALL_ENDPOINT = '/api/v1/tickets/all';
  private readonly TICKETS_ENDPOINT = '/api/v1/tickets';
  private readonly CREATE_TICKET_ENDPOINT = '/api/tickets';

  constructor(
    private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
  ) {}

  /**
   * Fetch all tickets (dashboard - operators)
   * Endpoint: GET /api/v1/tickets/all
   * Query params: page (0-indexed), size (1-100)
   */
  getTickets(page = 0, size = 20): Observable<TicketsResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('page', page.toString());
    httpParams = httpParams.set('size', size.toString());

    return this.http
      .get<any>(`${this.API_BASE_URL}${this.TICKETS_ALL_ENDPOINT}`, {
        params: httpParams,
      })
      .pipe(
        map((response: any) => this.validateAndTransformResponse(response)),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Fetch tickets for the authenticated user
   * Endpoint: GET /api/v1/tickets
   * Query params: page (0-indexed), size (1-100)
   */
  getUserTickets(page = 0, size = 20): Observable<TicketsResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('page', page.toString());
    httpParams = httpParams.set('size', size.toString());

    return this.http
      .get<any>(`${this.API_BASE_URL}${this.TICKETS_ENDPOINT}`, {
        params: httpParams,
      })
      .pipe(
        map((response: any) => this.validateAndTransformResponse(response)),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Get the total count of tickets matching an optional status/date filter,
   * without fetching a full page of items. Used to power KPI stat cards.
   * Reuses GET /api/v1/tickets/all (which already supports these filters
   * server-side) with size=1 and reads the `total` field from the response.
   *
   * @param filter - optional { status: 'PENDING' | 'CREATED', createdAfter: ISO-8601 }
   */
  getTicketsCount(filter: { status?: string; createdAfter?: string } = {}): Observable<number> {
    let httpParams = new HttpParams().set('page', '0').set('size', '1');
    if (filter.status) {
      httpParams = httpParams.set('status', filter.status);
    }
    if (filter.createdAfter) {
      httpParams = httpParams.set('createdAfter', filter.createdAfter);
    }

    return this.http
      .get<any>(`${this.API_BASE_URL}${this.TICKETS_ALL_ENDPOINT}`, { params: httpParams })
      .pipe(
        map((response: any) => response.total ?? 0),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Create a new ticket
   * Endpoint: POST /api/tickets
   * Response: 202 ACCEPTED with { messageId, status, timestamp }
   *
   * @param payload - { fecha, titulo, descripcion }
   */
  createTicket(payload: CreateTicketPayload): Observable<CreateTicketResponse> {
    return this.http
      .post<CreateTicketResponse>(`${this.API_BASE_URL}${this.CREATE_TICKET_ENDPOINT}`, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /**
   * Validate and transform the API response to match TicketsResponse interface
   * Ensures data integrity before passing to consumers
   *
   * @param response - Raw HTTP response from API
   * @returns Validated TicketsResponse
   * @throws Error if validation fails
   */
  private validateAndTransformResponse(response: any): TicketsResponse {
    if (!response.items || !Array.isArray(response.items)) {
      throw new Error('Invalid API response: missing or invalid "items" field');
    }

    if (response.page === undefined || response.size === undefined) {
      throw new Error('Invalid API response: missing pagination metadata');
    }

    // Validate each ticket using validator utility
    const validationResult = validateTicketsArray(response.items);
    if (!validationResult.valid) {
      const errorMessage = formatValidationErrors(validationResult.errors);
      throw new Error(`Invalid ticket data in response: ${errorMessage}`);
    }

    // Map items and preserve all fields from backend (including optional ones)
    const mappedItems = response.items.map((item: any) => ({
      id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      status: item.status,
      creatorId: item.creatorId || null,
      fecha: item.fecha,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      ticketType: item.ticketType,
      severity: item.severity,
      priority: item.priority,
    }));

    // DEBUG: Log first ticket to verify severity field is being mapped
    if (mappedItems.length > 0) {
      console.debug('[TicketsApiService] First mapped ticket:', {
        id: mappedItems[0].id,
        ticketType: mappedItems[0].ticketType,
        severity: mappedItems[0].severity,
      });
    }

    return {
      items: mappedItems,
      page: response.page,
      size: response.size,
      total: response.total ?? 0,
      totalPages: response.totalPages ?? 0,
    };
  }


  /**
   * Handle API errors and provide user-friendly messages
   *
   * @param error - HttpErrorResponse from failed request
   * @returns Observable that throws user-friendly error
   */
  private handleError(error: HttpErrorResponse | Error): Observable<never> {
    // Client-side validation errors (thrown by validateAndTransformResponse,
    // not returned by the HTTP layer) aren't HttpErrorResponses — surface
    // their own message instead of falling through to "Unknown error" below.
    if (!(error instanceof HttpErrorResponse)) {
      this.logErrorContext({
        endpoint: this.TICKETS_ALL_ENDPOINT,
        statusCode: undefined,
        timestamp: new Date().toISOString(),
        userMessage: error.message,
        error,
      });
      return throwError(() => ({ status: undefined, message: error.message, originalError: error }));
    }

    let errorMessage: string;

    if (error.status === 401) {
      // 401: Unauthorized - handled by interceptor, but catch here too
      errorMessage = 'Your session has expired. Please login again.';
    } else if (error.status === 403) {
      // 403: Forbidden
      errorMessage = 'You do not have permission to view tickets.';
    } else if (error.status === 400) {
      // 400: Bad Request
      errorMessage = 'Invalid request. Please check your parameters.';
    } else if (error.status >= 500) {
      // 5xx: Server Error
      errorMessage = 'Server error. Please try again later.';
    } else if (error.status === 0) {
      // Network error
      errorMessage = 'Unable to connect to the server. Please check your connection.';
    } else {
      errorMessage = `Failed to load tickets: ${error.statusText || 'Unknown error'}`;
    }

    // Log error with context for debugging
    this.logErrorContext({
      endpoint: this.TICKETS_ALL_ENDPOINT,
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      userMessage: errorMessage,
      error: error.error,
    });

    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      originalError: error,
    }));
  }

  /**
   * Log error context for debugging and monitoring
   *
   * @param context - Error context information
   */
  private logErrorContext(context: any): void {
    console.error('[TicketsApiService] Error occurred:', context);
    // In production, would send to error tracking service (Sentry, etc.)
  }
}



