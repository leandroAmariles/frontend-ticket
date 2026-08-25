import { Component, Input } from '@angular/core';
import { Ticket } from '../../models';

@Component({
    selector: 'app-ticket-row',
    template: `<div class="ticket-row">{{ ticket?.titulo }}</div>`,
    styles: [
        `
      .ticket-row {
        padding: 8px;
      }
    `,
    ],
    standalone: false
})
export class TicketRowComponent {
  @Input() ticket: Ticket | null = null;
}

