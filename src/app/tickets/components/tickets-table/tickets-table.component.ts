import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { Ticket } from '../../models';

/**
 * Tickets Table Component
 * Displays paginated table of tickets with sortable columns
 * Uses Angular Material table for accessibility and responsive design
 */
@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() pagination: { page: number; size: number; total: number; totalPages: number } | null = null;
  @Input() isLoading: boolean = false;
  @Input() dataTestId: string = 'tickets-table';

  @Output() pageChange = new EventEmitter<PageEvent>();

  displayedColumns: string[] = [
    'id',
    'titulo',
    'status',
    'creatorId',
    'createdAt',
  ];

  pageSizeOptions = [10, 20, 50];
  currentPageSize = 20;

  constructor() {}

  ngOnInit(): void {
    if (this.pagination) {
      this.currentPageSize = this.pagination.size;
    }
  }

  /**
   * Handle pagination events from MatPaginator
   */
  onPageEvent(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CREATED':
        return 'Created';
      default:
        return status;
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return date;
    }
  }

  /**
   * Truncate title for display
   */
  truncateTitle(title: string, maxLength: number = 40): string {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}

