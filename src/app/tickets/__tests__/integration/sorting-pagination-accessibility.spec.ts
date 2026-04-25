import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketsTableComponent } from '../../components/tickets-table/tickets-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
    component.tickets = [
      { id: '1', title: 'One', description: 'd', priority: 'low', status: 'open', assigned_to_id: null, assigned_to_name: null, created_at: new Date().toISOString() },
    ];
    component.meta = { total: 1, page: 1, page_size: 25, total_pages: 1 } as any;
    component.pageSize = 25;
    component.isLoading = false;
    fixture.detectChanges();
  });

  it('renders paginator with page size options and is keyboard focusable', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const paginator = compiled.querySelector('[data-testid="paginator"]');
    expect(paginator).toBeTruthy();

    const table = compiled.querySelector('table');
    expect(table).toBeTruthy();

    const rows = table!.querySelectorAll('tr[tabindex]');
    expect(rows.length).toBeGreaterThan(0);
  });
});

