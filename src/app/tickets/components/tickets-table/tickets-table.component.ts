import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { Ticket, PaginationMeta } from '../../models';
import {
  getPriorityLabel,
  getStatusLabel,
  formatDateForDisplay,
  truncateText,
} from '../../utils/transformers';

@Component({
  selector: 'app-tickets-table',
  templateUrl: './tickets-table.component.html',
  styleUrls: ['./tickets-table.component.scss'],
})
export class TicketsTableComponent implements OnInit {
  @Input() tickets: Ticket[] = [];
  @Input() meta: PaginationMeta | null = null;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 25;
  @Input() isLoading: boolean = false;

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<string>();

  displayedColumns: string[] = [
    'id',
    'title',
    'priority',
    'status',
    'assignedTo',
    'createdAt',
  ];

  pageSizeOptions = [25, 50];
  totalItems = 0;

  constructor() {}

  ngOnInit(): void {
    if (this.meta) {
      this.totalItems = this.meta.total;
    }
  }

  /**
   * Handle pagination events from MatPaginator
   */
  onPageEvent(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  /**
   * Handle sort events from MatSort
   */
  onSortChange(sortState: Sort): void {
    let sortParam = '';

    if (sortState.direction) {
      sortParam = `${sortState.active}:${sortState.direction}`;
      this.sortChange.emit(sortParam);
    }
  }

  /**
   * Transform ticket data for display
   */
  getPriorityLabel(priority: string): string {
    return getPriorityLabel(priority);
  }

  getStatusLabel(status: string): string {
    return getStatusLabel(status);
  }

  formatDate(date: string): string {
    return formatDateForDisplay(date);
  }

  truncateTitle(title: string): string {
    return truncateText(title, 40);
  }

  getFullTitle(title: string): string {
    return title;
  }

  getAssignedName(ticket: Ticket): string {
    return ticket.assigned_to_name || 'Unassigned';
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}

