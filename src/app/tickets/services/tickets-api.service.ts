import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Ticket,
  TicketsListParams,
  TicketsListResponse,
  CreateTicketPayload,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class TicketsApiService {
  private readonly apiUrl = `${environment.apiBaseUrl}/tickets`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch paginated list of tickets with optional filters and sorting
   */
  listTickets(params?: TicketsListParams): Observable<TicketsListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.page_size !== undefined) {
        httpParams = httpParams.set('page_size', params.page_size.toString());
      }
      if (params.priority) {
        httpParams = httpParams.set('priority', params.priority);
      }
      if (params.status) {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
    }

    return this.http.get<TicketsListResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Create a new ticket
   */
  createTicket(payload: CreateTicketPayload): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, payload);
  }

  /**
   * Get a specific ticket by ID
   */
  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }
}

