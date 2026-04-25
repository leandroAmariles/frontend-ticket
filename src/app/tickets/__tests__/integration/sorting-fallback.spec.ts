import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketsApiService } from '../../services/tickets-api.service';
import { of } from 'rxjs';

describe('TicketsStateService client-side sorting fallback', () => {
  it('sorts tickets by assigned_to_name when backend cannot', () => {
    const apiSpy = { listTickets: jest.fn() } as unknown as TicketsApiService;
    const svc = new TicketsStateService(apiSpy);

    // seed tickets
    (svc as any).ticketsSubject.next([
      { id: '1', assigned_to_name: 'Zoé', title: 'a', description: '', priority: 'low', status: 'open', created_at: new Date().toISOString() },
      { id: '2', assigned_to_name: 'Álvaro', title: 'b', description: '', priority: 'low', status: 'open', created_at: new Date().toISOString() },
      { id: '3', assigned_to_name: 'Bea', title: 'c', description: '', priority: 'low', status: 'open', created_at: new Date().toISOString() },
    ]);

    svc.applyClientSideSort('assigned_to_name', 'asc');

    const result = svc.getTickets().map((t) => t.assigned_to_name);
    expect(result).toEqual(['Álvaro', 'Bea', 'Zoé']);
  });
});

