import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { KnowledgeDocument, KnowledgeDocumentRequest } from '../models/knowledge-document.model';

interface ApiEnvelope<T> {
  status: string;
  data: T;
  timestamp: string;
}

/**
 * Talks to backend-ia's Knowledge Base API (RAG source documents), used by
 * the admin-only "knowledge base" screen. See KnowledgeDocumentController.java
 * in backend-ia for the source of truth on request/response shapes.
 */
@Injectable({
  providedIn: 'root',
})
export class KnowledgeApiService {
  private readonly baseUrl = environment.knowledgeApiBaseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<KnowledgeDocument[]> {
    return this.http.get<ApiEnvelope<KnowledgeDocument[]>>(this.baseUrl).pipe(
      map((response) => response.data),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  getByKey(categoryKey: string): Observable<KnowledgeDocument> {
    return this.http.get<ApiEnvelope<KnowledgeDocument>>(`${this.baseUrl}/${categoryKey}`).pipe(
      map((response) => response.data),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  upsert(categoryKey: string, request: KnowledgeDocumentRequest): Observable<KnowledgeDocument> {
    return this.http.put<ApiEnvelope<KnowledgeDocument>>(`${this.baseUrl}/${categoryKey}`, request).pipe(
      map((response) => response.data),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  delete(categoryKey: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${categoryKey}`).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.status === 0) {
      message = 'No se pudo conectar con el servicio de conocimiento (backend-ia).';
    } else if (error.status === 400) {
      message = 'Datos inválidos. Revisa los límites de longitud de cada campo.';
    } else if (error.status === 404) {
      message = 'La categoría solicitada no existe.';
    } else if (error.status >= 500) {
      message = 'Error del servidor. Inténtalo de nuevo más tarde.';
    } else {
      message = 'Error al comunicarse con el servicio de conocimiento.';
    }
    return throwError(() => ({ status: error.status, message, originalError: error }));
  }
}
