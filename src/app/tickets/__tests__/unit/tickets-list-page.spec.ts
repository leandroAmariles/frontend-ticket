/**
 * Unit Tests: Tickets List Page Component - Page Size Change
 * Tests for User Story 1: MatPaginator pageSizeChange event handler
 * Tests for User Story 2: Selector value persistence during load
 *
 * @feature 003-fix-page-size-selector
 * @story US1, US2
 * @task T012, T015, T016, T020, T023
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TicketsListPageComponent } from '../../pages/tickets-list-page/tickets-list-page.component';
import { TicketsStateService } from '../../services/tickets-state.service';
import { of } from 'rxjs';

const mockDialogProvider = { provide: MatDialog, useValue: { open: jest.fn() } };

describe('TicketsListPageComponent - Page Size Change (T012, T015, T016, T020, T023)', () => {
  let component: TicketsListPageComponent;
  let fixture: ComponentFixture<TicketsListPageComponent>;
  let stateService: TicketsStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketsListPageComponent],
      providers: [
        {
          provide: TicketsStateService,
          useValue: {
            tickets$: of([]),
            loading$: of(false),
            error$: of(null),
            pagination$: of({ page: 0, size: 20, total: 100, totalPages: 5 }),
            updatePageSize: jest.fn(),
            loadTickets: jest.fn(),
            reset: jest.fn(),
          },
        },
        mockDialogProvider,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketsListPageComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(TicketsStateService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('onPageSizeChange() - T012, T015', () => {
    it('should have onPageSizeChange method', () => {
      expect(typeof component.onPageSizeChange).toBe('function');
    });

    it('should call stateService.updatePageSize when page size changes', () => {
      // Arrange
      const newSize = 10;
      const event = { pageSize: newSize, pageIndex: 0 };

      // Act
      component.onPageSizeChange(event);

      // Assert
      expect(stateService.updatePageSize).toHaveBeenCalledWith(newSize);
    });

    it('should call stateService.updatePageSize with 20 when user selects 20', () => {
      // Arrange
      const event = { pageSize: 20, pageIndex: 0 };

      // Act
      component.onPageSizeChange(event);

      // Assert
      expect(stateService.updatePageSize).toHaveBeenCalledWith(20);
    });

    it('should call stateService.updatePageSize with 50 when user selects 50', () => {
      // Arrange
      const event = { pageSize: 50, pageIndex: 0 };

      // Act
      component.onPageSizeChange(event);

      // Assert
      expect(stateService.updatePageSize).toHaveBeenCalledWith(50);
    });

    it('should extract pageSize from event correctly', () => {
      // Arrange
      const event = { pageSize: 25, pageIndex: 2, length: 500, previousPageIndex: 1 };

      // Act
      component.onPageSizeChange(event);

      // Assert
      expect(stateService.updatePageSize).toHaveBeenCalledWith(25);
    });
  });

  describe('Template Binding - T016, T023', () => {
    it('should have reference to pagination$ observable', () => {
      expect(component.pagination$).toBeDefined();
    });

    it('should have reference to loading$ observable', () => {
      expect(component.loading$).toBeDefined();
    });

    it('should have reference to error$ observable', () => {
      expect(component.error$).toBeDefined();
    });

    it('should have reference to tickets$ observable', () => {
      expect(component.tickets$).toBeDefined();
    });
  });

  describe('Error State Display - T024', () => {
    it('should component have access to error$ for error display', (done) => {
      // Arrange
      const mockError = 'Test error message';
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TicketsListPageComponent],
        providers: [
          {
            provide: TicketsStateService,
            useValue: {
              tickets$: of([]),
              loading$: of(false),
              error$: of(mockError),
              pagination$: of({ page: 0, size: 20, total: 100, totalPages: 5 }),
              updatePageSize: jest.fn(),
              loadTickets: jest.fn(),
              reset: jest.fn(),
            },
          },
          mockDialogProvider,
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      const newFixture = TestBed.createComponent(TicketsListPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      // Act & Assert
      newComponent.error$.subscribe((error) => {
        expect(error).toBe(mockError);
        done();
      });
    });
  });

  describe('Loading State Display - T025', () => {
    it('should component have access to loading$ for loading display', (done) => {
      // Arrange
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TicketsListPageComponent],
        providers: [
          {
            provide: TicketsStateService,
            useValue: {
              tickets$: of([]),
              loading$: of(true),
              error$: of(null),
              pagination$: of({ page: 0, size: 20, total: 100, totalPages: 5 }),
              updatePageSize: jest.fn(),
              loadTickets: jest.fn(),
              reset: jest.fn(),
            },
          },
          mockDialogProvider,
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      const newFixture = TestBed.createComponent(TicketsListPageComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      // Act & Assert
      newComponent.loading$.subscribe((loading) => {
        expect(loading).toBe(true);
        done();
      });
    });
  });
});

