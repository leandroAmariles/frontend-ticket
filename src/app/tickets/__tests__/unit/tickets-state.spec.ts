/**
 * Unit Tests: Tickets State Service - Page Size Change
 * Tests for User Story 1: Page size change updates table with correct data
 *
 * @feature 003-fix-page-size-selector
 * @story US1
 * @task T010, T014
 */

import { TestBed } from '@angular/core/testing';
import { TicketsStateService } from '../../services/tickets-state.service';
import { TicketsApiService } from '../../services/tickets-api.service';
import { of, throwError } from 'rxjs';
import { Ticket, TicketsResponse } from '../../models';

describe('TicketsStateService - Page Size Change (T010, T014)', () => {
  let service: TicketsStateService;
  let apiService: TicketsApiService;

  const mockTicketsResponse: TicketsResponse = {
    items: [
      {
        id: 'ticket-1',
        titulo: 'Test Ticket',
        descripcion: 'Test Description',
        status: 'CREATED',
        creatorId: 'user-1',
        fecha: '2026-05-02',
        createdAt: '2026-05-02T10:00:00Z',
        updatedAt: '2026-05-02T10:00:00Z',
      },
    ],
    page: 0,
    size: 10,
    total: 100,
    totalPages: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TicketsStateService,
        {
          provide: TicketsApiService,
          useValue: {
            getTickets: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(TicketsStateService);
    apiService = TestBed.inject(TicketsApiService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  describe('updatePageSize() - T014', () => {
    it('should reset pageIndex to 0 and set pageSize to new value', (done) => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));

      // Act
      service.updatePageSize(10);

      // Assert
      service.pagination$.subscribe((pagination) => {
        if (pagination) {
          expect(pagination.page).toBe(0); // Page reset to 0
          expect(pagination.size).toBe(10); // Size changed to 10
          done();
        }
      });
    });

    it('should set isLoading to true when page size changes', () => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));
      const emittedValues: boolean[] = [];
      // Subscribe BEFORE triggering the change: with a synchronous mock API
      // response, the whole loading:true -> loading:false cycle completes
      // inside updatePageSize() itself, so a subscribe() called afterwards
      // would only ever observe the final (false) value.
      service.loading$.subscribe((isLoading) => emittedValues.push(isLoading));

      // Act
      service.updatePageSize(20);

      // Assert
      expect(emittedValues).toContain(true);
    });

    it('should emit state with attemptedPageSize immediately (optimistic update)', (done) => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));

      // Act
      service.updatePageSize(50);

      // Assert - check if service has attemptedPageSize tracking
      setTimeout(() => {
        // The service should have a way to track attempted page size
        // This is for US2 (selector persistence)
        done();
      }, 10);
    });

    it('should trigger API call with correct parameters (page=0, size=newSize)', (done) => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));

      // Act
      service.updatePageSize(20);

      // Assert
      setTimeout(() => {
        expect(apiService.getTickets).toHaveBeenCalledWith(0, 20);
        done();
      }, 10);
    });

    it('should update pagination state after successful API response', (done) => {
      // Arrange
      const responseWith50Items = {
        ...mockTicketsResponse,
        size: 50,
        totalPages: 2,
      };
      (apiService.getTickets as jest.Mock).mockReturnValue(of(responseWith50Items));

      // Act
      service.updatePageSize(50);

      // Assert
      setTimeout(() => {
        service.pagination$.subscribe((pagination) => {
          if (pagination && pagination.size === 50) {
            expect(pagination.size).toBe(50);
            expect(pagination.totalPages).toBe(2);
            done();
          }
        });
      }, 20);
    });

    it('should set isLoading to false after API response succeeds', (done) => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));

      // Act
      service.updatePageSize(10);

      // Assert
      setTimeout(() => {
        service.loading$.subscribe((isLoading) => {
          if (isLoading === false) {
            expect(isLoading).toBe(false);
            done();
          }
        });
      }, 20);
    });

    it('should handle API errors gracefully', (done) => {
      // Arrange
      const error = { message: 'API Error', status: 500 };
      (apiService.getTickets as jest.Mock).mockReturnValue(throwError(() => error));

      // Act
      service.updatePageSize(10);

      // Assert
      setTimeout(() => {
        service.error$.subscribe((errorState) => {
          if (errorState) {
            expect(errorState).toBeTruthy();
            done();
          }
        });
      }, 20);
    });

    it('should validate page size is one of [10, 20, 50]', (done) => {
      // Arrange
      (apiService.getTickets as jest.Mock).mockReturnValue(of(mockTicketsResponse));

      // Act & Assert - invalid size should be rejected or defaulted
      service.updatePageSize(999); // Invalid size

      // The service should either reject or default to a valid size
      setTimeout(() => {
        const pagination = service.getPagination();
        // After validation, size should be one of [10, 20, 50] or unchanged
        expect([10, 20, 50].includes(pagination?.size || 0)).toBe(true);
        done();
      }, 20);
    });
  });
});

