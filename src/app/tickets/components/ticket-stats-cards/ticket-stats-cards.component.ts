import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TicketsApiService } from '../../services/tickets-api.service';

interface StatCard {
  label: string;
  value: number | null;
  icon: string;
  colorClass: string;
}

@Component({
    selector: 'app-ticket-stats-cards',
    templateUrl: './ticket-stats-cards.component.html',
    styleUrls: ['./ticket-stats-cards.component.scss'],
    standalone: false
})
export class TicketStatsCardsComponent implements OnInit, OnDestroy {
  cards: StatCard[] = [
    { label: 'Total tickets', value: null, icon: 'confirmation_number', colorClass: 'card-blue' },
    { label: 'Pendientes', value: null, icon: 'hourglass_empty', colorClass: 'card-amber' },
    { label: 'Creados', value: null, icon: 'task_alt', colorClass: 'card-green' },
    { label: 'Creados hoy', value: null, icon: 'today', colorClass: 'card-purple' },
  ];

  private destroy$ = new Subject<void>();

  constructor(private ticketsApi: TicketsApiService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    forkJoin({
      total: this.ticketsApi.getTicketsCount(),
      pending: this.ticketsApi.getTicketsCount({ status: 'PENDING' }),
      created: this.ticketsApi.getTicketsCount({ status: 'CREATED' }),
      today: this.ticketsApi.getTicketsCount({ createdAfter: startOfToday.toISOString() }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ total, pending, created, today }) => {
          this.cards[0].value = total;
          this.cards[1].value = pending;
          this.cards[2].value = created;
          this.cards[3].value = today;
        },
        error: () => {
          // Non-critical widget — leave cards as "—" (null) rather than blocking the page
        },
      });
  }
}
