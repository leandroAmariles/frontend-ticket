import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { Ticket } from '../../models';

/** Higher rank sorts first when sorting "critical first" (descending). */
const SEVERITY_RANK: Record<'low' | 'medium' | 'high' | 'critical' | 'unknown', number> = {
  unknown: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

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
export class TicketsTableComponent implements OnInit, OnChanges {
  @Input() tickets: Ticket[] = [];
  @Input() pagination: { page: number; size: number; total: number; totalPages: number } | null = null;
  @Input() isLoading: boolean = false;
  @Input() dataTestId: string = 'tickets-table';

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() createTicket = new EventEmitter<void>();

  displayedColumns: string[] = [
    'id',
    'titulo',
    'status',
    'createdAt',
    'type',
    'severity',
  ];

  pageSizeOptions = [10, 20, 50];
  currentPageSize = 20;

  /**
   * Default sort: critical first, least critical last, on the "Prioridad" column.
   * Sorting is client-side over the currently loaded page only — the backend
   * endpoint (GET /api/v1/tickets/all) has no sort-by-severity query param, so
   * this reorders the visible rows, not the full server-side pagination.
   */
  currentSort: Sort = { active: 'severity', direction: 'desc' };

  constructor() {}

  ngOnInit(): void {
    if (this.pagination) {
      this.currentPageSize = this.pagination.size;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Keep currentPageSize in sync when pagination input changes
    if (changes['pagination'] && this.pagination) {
      this.currentPageSize = this.pagination.size;
    }
  }

  /**
   * Handle pagination events from MatPaginator
   */
  onPageEvent(event: PageEvent): void {
    // Update local size immediately so the selector doesn't revert
    this.currentPageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  /**
   * Handle a click on a sortable column header (currently only "Prioridad").
   */
  onSortChange(sort: Sort): void {
    this.currentSort = sort;
  }

  /**
   * Tickets for the current page, reordered by severity when the "Prioridad"
   * sort is active. Falls back to the server-provided order (createdAt DESC)
   * when the sort is cleared or not active on this column.
   */
  get sortedTickets(): Ticket[] {
    if (this.currentSort.active !== 'severity' || !this.currentSort.direction) {
      return this.tickets;
    }
    const factor = this.currentSort.direction === 'asc' ? 1 : -1;
    return [...this.tickets].sort(
      (a, b) => factor * (this.severityRank(a.severity) - this.severityRank(b.severity))
    );
  }

  private severityRank(severity: string | undefined): number {
    return SEVERITY_RANK[this.normalizeSeverityKey(severity)];
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

  getTypeLabel(ticketType: string | undefined): string {
    if (!ticketType) return '—';
    switch (ticketType) {
      case 'TAREA':      return 'Tarea';
      case 'INCIDENCIA': return 'Incidencia';
      case 'CONSULTA':   return 'Consulta';
      default:           return ticketType.toLowerCase()
        .charAt(0).toUpperCase() + ticketType.slice(1).toLowerCase();
    }
  }

  /**
   * Get the CSS class for ticket type
   */
  getTypeCssClass(ticketType: string | undefined): string {
    if (!ticketType) return '';
    return 'type-' + ticketType;
  }

  /**
   * Normalize a raw severity value to one of a fixed set of keys.
   * Two vocabularies exist in the data: the live AI categorization pipeline sends
   * English (low/medium/high/critical), while seeded/test data uses Spanish
   * (BAJA/NORMAL/ALTA/CRÍTICA — see V10__Update_severity_test_data.sql). Both need
   * to resolve to the same color, or rows from one source silently lose their color.
   * Accents are stripped before matching so "crítica"/"CRÍTICA"/"critica" all match.
   */
  private normalizeSeverityKey(severity: string | undefined): 'low' | 'medium' | 'high' | 'critical' | 'unknown' {
    const normalized = (severity ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, ''); // strip accents (í -> i, etc.)

    switch (normalized) {
      case 'low':
      case 'baja':
        return 'low';
      case 'medium':
      case 'media':
      case 'normal':
        return 'medium';
      case 'high':
      case 'alta':
        return 'high';
      case 'critical':
      case 'critica':
        return 'critical';
      default:
        return 'unknown';
    }
  }

  getSeverityLabel(severity: string | undefined): string {
    if (!severity) return '—';
    switch (this.normalizeSeverityKey(severity)) {
      case 'low':      return 'Baja';
      case 'medium':   return 'Media';
      case 'high':     return 'Alta';
      case 'critical': return 'Crítica';
      default:         return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
    }
  }

  /**
   * Get the CSS class for severity level
   */
  getSeverityCssClass(severity: string | undefined): string {
    if (!severity) return '';
    return 'severity-' + this.normalizeSeverityKey(severity);
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

