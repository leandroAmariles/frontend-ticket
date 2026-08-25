import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorMessage {
  message: string;
  code?: string | number;
  timestamp: Date;
  details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private errorSubject = new BehaviorSubject<ErrorMessage | null>(null);
  public error$: Observable<ErrorMessage | null> = this.errorSubject.asObservable();

  /**
   * Handle and log an error
   */
  handleError(error: any, context?: string): void {
    const errorMessage = this.buildErrorMessage(error, context);
    this.logError(errorMessage);
    this.errorSubject.next(errorMessage);
  }

  /**
   * Clear the current error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  /**
   * Get the current error message
   */
  getCurrentError(): ErrorMessage | null {
    return this.errorSubject.value;
  }

  /**
   * Build a user-friendly error message
   */
  private buildErrorMessage(error: any, context?: string): ErrorMessage {
    let message = 'An unexpected error occurred';
    let code: string | number | undefined;

    if (error) {
      if (typeof error === 'string') {
        message = error;
      } else if (error.message) {
        message = error.message;
      } else if (error.error?.message) {
        message = error.error.message;
      }

      code = error.status || error.code;
    }

    return {
      message,
      code,
      timestamp: new Date(),
      details: { context, ...error },
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(errorMessage: ErrorMessage): void {
    // In a real application, this would send to a monitoring service
    console.error('[ErrorHandlerService]', {
      message: errorMessage.message,
      code: errorMessage.code,
      timestamp: errorMessage.timestamp,
      details: errorMessage.details,
    });
  }

  /**
   * Get a user-friendly error message based on HTTP status
   */
  getUserFriendlyMessage(status?: number | string): string {
    const statusMap: Record<string | number, string> = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'You are not authenticated. Please log in.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.',
    };

    return statusMap[status!] || 'An error occurred. Please try again.';
  }
}

