import { TicketsTableComponent } from '../tickets-table.component';

describe('TicketsTableComponent severity normalization', () => {
  let component: TicketsTableComponent;

  beforeEach(() => {
    component = new TicketsTableComponent();
  });

  const englishToSpanishLabel: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  };

  const seedDataToCssClass: Record<string, string> = {
    BAJA: 'severity-low',
    NORMAL: 'severity-medium',
    ALTA: 'severity-high',
    'CRÍTICA': 'severity-critical',
  };

  it('labels the live AI pipeline vocabulary (English) correctly', () => {
    for (const [raw, expectedLabel] of Object.entries(englishToSpanishLabel)) {
      expect(component.getSeverityLabel(raw)).toBe(expectedLabel);
    }
  });

  it('colors the seeded test-data vocabulary (Spanish, uppercase) the same as its English equivalent', () => {
    for (const [raw, expectedClass] of Object.entries(seedDataToCssClass)) {
      expect(component.getSeverityCssClass(raw)).toBe(expectedClass);
    }
  });

  it('is case- and accent-insensitive', () => {
    expect(component.getSeverityCssClass('critica')).toBe('severity-critical');
    expect(component.getSeverityCssClass('Crítica')).toBe('severity-critical');
    expect(component.getSeverityCssClass('CRITICA')).toBe('severity-critical');
    expect(component.getSeverityCssClass('baja')).toBe('severity-low');
    expect(component.getSeverityCssClass('normal')).toBe('severity-medium');
  });

  it('falls back to "unknown" for unrecognized values instead of silently losing color', () => {
    expect(component.getSeverityCssClass('some-other-value')).toBe('severity-unknown');
  });

  it('returns an empty class and em-dash label when there is no severity at all', () => {
    expect(component.getSeverityCssClass(undefined)).toBe('');
    expect(component.getSeverityLabel(undefined)).toBe('—');
  });
});

describe('TicketsTableComponent priority sorting', () => {
  let component: TicketsTableComponent;

  const makeTicket = (id: string, severity: string | undefined) =>
    ({ id, titulo: id, descripcion: '', status: 'CREATED', severity } as any);

  beforeEach(() => {
    component = new TicketsTableComponent();
    component.tickets = [
      makeTicket('low-1', 'low'),
      makeTicket('critical-1', 'CRÍTICA'),
      makeTicket('none-1', undefined),
      makeTicket('medium-1', 'NORMAL'),
      makeTicket('high-1', 'alta'),
    ];
  });

  it('defaults to critical-first (descending) on the severity column', () => {
    expect(component.currentSort).toEqual({ active: 'severity', direction: 'desc' });
    const ids = component.sortedTickets.map((t) => t.id);
    expect(ids).toEqual(['critical-1', 'high-1', 'medium-1', 'low-1', 'none-1']);
  });

  it('reverses to least-critical-first (ascending) when the header is clicked again', () => {
    component.onSortChange({ active: 'severity', direction: 'asc' });
    const ids = component.sortedTickets.map((t) => t.id);
    expect(ids).toEqual(['none-1', 'low-1', 'medium-1', 'high-1', 'critical-1']);
  });

  it('falls back to the original (server) order once the sort is cleared', () => {
    component.onSortChange({ active: 'severity', direction: '' });
    expect(component.sortedTickets).toBe(component.tickets);
  });

  it('does not reorder the original tickets array (non-mutating)', () => {
    const originalOrder = component.tickets.map((t) => t.id);
    void component.sortedTickets;
    expect(component.tickets.map((t) => t.id)).toEqual(originalOrder);
  });
});
