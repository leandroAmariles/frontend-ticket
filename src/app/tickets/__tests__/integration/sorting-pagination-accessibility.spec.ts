import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketsTableComponent } from '../../components/tickets-table/tickets-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Ticket } from '../../models';

describe('TicketsTableComponent accessibility and pagination', () => {
  let fixture: ComponentFixture<TicketsTableComponent>;
  let component: TicketsTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketsTableComponent],
      imports: [NoopAnimationsModule, MatTableModule, MatPaginatorModule, MatSortModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsTableComponent);
    component = fixture.componentInstance;
    const tickets: Ticket[] = [
      {
        id: '1',
        titulo: 'One',
        descripcion: 'd',
        status: 'PENDING',
        creatorId: null,
        fecha: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    component.tickets = tickets;
    component.pagination = { page: 0, size: 25, total: 1, totalPages: 1 };
    component.isLoading = false;
    fixture.detectChanges();
  });

  it('renders paginator bound to the pagination input, with page size options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const paginator = compiled.querySelector('[data-testid="paginator"]');
    expect(paginator).toBeTruthy();
    expect(component.pageSizeOptions).toEqual([10, 20, 50]);

    const table = compiled.querySelector('table');
    expect(table).toBeTruthy();
  });

  it('exposes the table with an accessible role and label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('table[role="table"]');
    expect(table).toBeTruthy();
    expect(table!.getAttribute('aria-label')).toBe('Tickets table');

    const rows = compiled.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
  });
});
