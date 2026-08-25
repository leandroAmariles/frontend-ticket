/**
 * Contract tests for GET /api/v1/tickets/all
 * Validates the real backend contract: page/size query params, and an
 * { items, page, size, total, totalPages } response shape (see
 * TicketsApiService.getTickets and models/index.ts).
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TicketsApiService } from '../../services/tickets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { TicketsResponse } from '../../models';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const BASE_URL = 'http://localhost:8080/api/v1/tickets/all';

describe('GET /api/v1/tickets/all - Contract Tests', () => {
  let service: TicketsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [TicketsApiService, ErrorHandlerService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    service = TestBed.inject(TicketsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return response with an items array and pagination fields', (done) => {
    service.getTickets(1, 25).subscribe((response: TicketsResponse) => {
      expect(response).toHaveProperty('items');
      expect(response).toHaveProperty('page');
      expect(response).toHaveProperty('size');
      expect(response).toHaveProperty('total');
      expect(response).toHaveProperty('totalPages');
      expect(Array.isArray(response.items)).toBe(true);
      done();
    });

    const req = httpMock.expectOne(`${BASE_URL}?page=1&size=25`);
    expect(req.request.method).toBe('GET');

    const mockResponse: TicketsResponse = {
      items: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          titulo: 'No puedo iniciar sesión',
          descripcion: 'El usuario reporta error 500 al iniciar sesión',
          status: 'PENDING',
          creatorId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          fecha: '2026-04-25T10:15:30Z',
          createdAt: '2026-04-25T10:15:30Z',
        },
      ],
      page: 1,
      size: 25,
      total: 1234,
      totalPages: 50,
    };

    req.flush(mockResponse);
  });

  it('should include pagination metadata', (done) => {
    service.getTickets(1, 50).subscribe((response: TicketsResponse) => {
      expect(response.total).toBeDefined();
      expect(response.page).toBe(1);
      expect(response.size).toBe(50);
      expect(response.totalPages).toBeDefined();
      done();
    });

    const req = httpMock.expectOne(`${BASE_URL}?page=1&size=50`);

    const mockResponse: TicketsResponse = {
      items: [],
      page: 1,
      size: 50,
      total: 100,
      totalPages: 2,
    };

    req.flush(mockResponse);
  });

  it('should send page and size as query params', (done) => {
    service.getTickets(3, 10).subscribe(() => done());

    const req = httpMock.expectOne(
      (request) =>
        request.url === BASE_URL &&
        request.params.get('page') === '3' &&
        request.params.get('size') === '10'
    );

    expect(req.request.method).toBe('GET');

    req.flush({ items: [], page: 3, size: 10, total: 0, totalPages: 0 });
  });

  it('should handle an empty items array', (done) => {
    service.getTickets(2, 25).subscribe((response: TicketsResponse) => {
      expect(response.items).toEqual([]);
      expect(response.total).toBe(0);
      done();
    });

    const req = httpMock.expectOne(`${BASE_URL}?page=2&size=25`);

    req.flush({ items: [], page: 2, size: 25, total: 0, totalPages: 0 });
  });

  it('should handle a null creatorId (unassigned ticket)', (done) => {
    service.getTickets(1, 25).subscribe((response: TicketsResponse) => {
      const unassigned = response.items[0];
      expect(unassigned.creatorId).toBeNull();
      done();
    });

    const req = httpMock.expectOne(`${BASE_URL}?page=1&size=25`);

    const mockResponse: TicketsResponse = {
      items: [
        {
          id: '123',
          titulo: 'Test',
          descripcion: 'Test',
          status: 'PENDING',
          creatorId: null,
          fecha: '2026-04-25T10:15:30Z',
          createdAt: '2026-04-25T10:15:30Z',
        },
      ],
      page: 1,
      size: 25,
      total: 1,
      totalPages: 1,
    };

    req.flush(mockResponse);
  });
});
