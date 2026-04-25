import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketsListParams, Ticket, PaginationMeta } from '../../models';

@Component({
  selector: 'app-tickets-list-page',
  templateUrl: './tickets-list-page.component.html',
  styleUrls: ['./tickets-list-page.component.scss'],
})
export class TicketsListPageComponent implements OnInit, OnDestroy {
  // Observables from state service
  tickets$ = this.ticketsState.tickets$;
  loading$ = this.ticketsState.loading$;
  error$ = this.ticketsState.error$;
  meta$ = this.ticketsState.meta$;

  // Local state
  currentParams: TicketsListParams = {
    page: 1,
    page_size: 25,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private ticketsState: TicketsStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ticketsState.reset();
  }

  /**
   * Refresh the ticket list with current parameters
   */
  refresh(params?: Partial<TicketsListParams>): void {
    if (params) {
      this.currentParams = { ...this.currentParams, ...params };
    }
    this.ticketsState.refresh(this.currentParams).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  /**
   * Handle pagination changes
   */
  onPageChange(event: any): void {
    this.refresh({
      page: event.pageIndex + 1, // Material paginator uses 0-based index
      page_size: event.pageSize,
    });
  }

  /**
   * Handle filter changes (priority, status)
   */
  onFiltersChange(filters: { priority?: string; status?: string }): void {
    this.refresh({
      page: 1, // Reset to first page when filters change
      priority: filters.priority ? filters.priority : undefined,
      status: filters.status ? filters.status : undefined,
    });
  }

  /**
   * Handle sort changes
   */
  onSortChange(sort: string): void {
    this.refresh({
      page: 1, // Reset to first page when sorting changes
      sort,
    });
  }

  /**
   * Navigate to create ticket page
   */
  navigateToCreate(): void {
    this.router.navigate(['/tickets/new']);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByTicketId(index: number, ticket: Ticket): string {
    return ticket.id;
  }
}

