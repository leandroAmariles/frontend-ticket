/**
 * Integration tests for tickets listing page
 * Tests the complete flow of loading and displaying tickets
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { TicketsListPageComponent } from '../../pages/tickets-list-page/tickets-list-page.component';
import { TicketsTableComponent } from '../../components/tickets-table/tickets-table.component';
import { TicketFiltersComponent } from '../../components/ticket-filters/ticket-filters.component';
import { TicketsStateService } from '../../services/tickets-state.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('TicketsListPage - Integration Tests', () => {
  let component: TicketsListPageComponent;
  let fixture: ComponentFixture<TicketsListPageComponent>;
  let mockStateService: any;

  beforeEach(async () => {
    mockStateService = {
      refresh: jest.fn(),
      reset: jest.fn(),
      tickets$: of([
        {
          id: '1',
          title: 'Test Ticket 1',
          description: 'Description 1',
          priority: 'high',
          status: 'open',
          assigned_to_id: null,
          assigned_to_name: null,
          created_at: '2026-04-25T10:15:30Z',
        },
      ]),
      loading$: of(false),
      error$: of(null),
      meta$: of({ total: 1, page: 1, page_size: 25, total_pages: 1 }),
    } as any;

    mockStateService.refresh.mockReturnValue(
      of({ data: [], meta: { total: 0, page: 1, page_size: 25, total_pages: 0 } })
    );

    await TestBed.configureTestingModule({
      declarations: [
        TicketsListPageComponent,
        TicketsTableComponent,
        TicketFiltersComponent,
      ],
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatProgressSpinnerModule,
      ],
      providers: [{ provide: TicketsStateService, useValue: mockStateService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsListPageComponent);
    component = fixture.componentInstance;
  });

  describe('Page Load', () => {
    it('should load and display tickets', () => {
      fixture.detectChanges();

      expect(mockStateService.refresh).toHaveBeenCalled();
      expect(component.tickets$).toBeDefined();
    });

    it('should display New Ticket button', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('[data-testid="btn-new-ticket"]');
      expect(button).toBeTruthy();
    });

    it('should display filters component', () => {
      fixture.detectChanges();

      const filters = fixture.debugElement.query(
        (el) => el.name === 'app-ticket-filters'
      );
      expect(filters).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      fixture.detectChanges();

      const pageEvent = { pageIndex: 1, pageSize: 50, length: 100 };
      component.onPageChange(pageEvent);

      expect(mockStateService.refresh).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2, // pageIndex is 0-based
          page_size: 50,
        })
      );
    });
  });

  describe('Filtering', () => {
    it('should handle filter changes', () => {
      fixture.detectChanges();

      const filters = { priority: 'high', status: 'open' };
      component.onFiltersChange(filters);

      expect(mockStateService.refresh).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          priority: 'high',
          status: 'open',
        })
      );
    });

    it('should reset page when filters change', () => {
      fixture.detectChanges();
      component.currentParams.page = 3;

      const filters = { priority: 'high' };
      component.onFiltersChange(filters);

      const calls = mockStateService.refresh.mock.calls;
      const lastCall = calls.length ? calls[calls.length - 1][0] : undefined;
      expect(lastCall?.page).toBe(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate to create page on New Ticket click', () => {
      fixture.detectChanges();

      const router = TestBed.inject(require('@angular/router').Router) as any;
      jest.spyOn(router, 'navigate');

      component.navigateToCreate();

      expect(router.navigate).toHaveBeenCalledWith(['/tickets/new']);
    });
  });

  describe('Cleanup', () => {
    it('should reset state on destroy', () => {
      fixture.detectChanges();
      fixture.destroy();

      expect(mockStateService.reset).toHaveBeenCalled();
    });
  });
});

