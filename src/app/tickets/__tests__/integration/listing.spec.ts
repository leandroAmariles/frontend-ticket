/**
 * Integration tests for tickets listing page
 * Tests the complete flow of loading and displaying tickets
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, Observable } from 'rxjs';

import { TicketsListPageComponent } from '../../pages/tickets-list-page/tickets-list-page.component';
import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketCreateDialogComponent } from '../../components/ticket-create-dialog/ticket-create-dialog.component';
import { Ticket } from '../../models';

describe('TicketsListPage - Integration Tests', () => {
  let component: TicketsListPageComponent;
  let fixture: ComponentFixture<TicketsListPageComponent>;
  let mockStateService: {
    loadTickets: jest.Mock;
    reset: jest.Mock;
    tickets$: Observable<Ticket[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    pagination$: Observable<{ page: number; size: number; total: number; totalPages: number } | null>;
  };
  let mockDialog: { open: jest.Mock };

  beforeEach(async () => {
    mockStateService = {
      loadTickets: jest.fn(),
      reset: jest.fn(),
      tickets$: of([
        {
          id: '1',
          titulo: 'Test Ticket 1',
          descripcion: 'Description 1',
          status: 'PENDING',
          creatorId: null,
          fecha: '2026-04-25T10:15:30Z',
          createdAt: '2026-04-25T10:15:30Z',
        },
      ]),
      loading$: of(false),
      error$: of(null),
      pagination$: of({ page: 0, size: 20, total: 1, totalPages: 1 }),
    };

    mockDialog = { open: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [TicketsListPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TicketsStateService, useValue: mockStateService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsListPageComponent);
    component = fixture.componentInstance;
  });

  describe('Page Load', () => {
    it('should load tickets on init', () => {
      fixture.detectChanges();

      expect(mockStateService.loadTickets).toHaveBeenCalledWith(0, 20);
      expect(component.tickets$).toBeDefined();
    });

    it('should display New Ticket button', () => {
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('[data-testid="btn-new-ticket"]');
      expect(button).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      fixture.detectChanges();
      mockStateService.loadTickets.mockClear(); // ignore the initial ngOnInit call

      const pageEvent = { pageIndex: 1, pageSize: 50 };
      component.onPageChange(pageEvent);

      expect(mockStateService.loadTickets).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('Navigation', () => {
    it('should open the create-ticket dialog on New Ticket click', () => {
      fixture.detectChanges();
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.openCreateDialog();

      expect(mockDialog.open).toHaveBeenCalledWith(
        TicketCreateDialogComponent,
        expect.objectContaining({ width: '560px' })
      );
    });

    it('should reload the current page when the dialog closes with a created ticket', () => {
      fixture.detectChanges();
      mockStateService.loadTickets.mockClear();
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component.openCreateDialog();

      expect(mockStateService.loadTickets).toHaveBeenCalledWith(0, 20);
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
