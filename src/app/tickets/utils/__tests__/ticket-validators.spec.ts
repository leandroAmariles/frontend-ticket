/**
 * Unit Tests: Ticket Validators
 * Tests for ticket validation utility functions
 */

import {
  isValidTicket,
  validateTicketResponse,
  validateTicketsArray,
  formatValidationErrors,
} from '../ticket-validators';
import { Ticket } from '../../models';

describe('Ticket Validators', () => {
  describe('isValidTicket - Type Guard', () => {
    it('should return true for a valid ticket object', () => {
      const validTicket: Ticket = {
        id: '1',
        titulo: 'Test Ticket',
        descripcion: 'A test ticket',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        fecha: '2024-01-01',
      };

      const result = isValidTicket(validTicket);
      expect(result).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isValidTicket(null)).toBe(false);
      expect(isValidTicket(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isValidTicket('string')).toBe(false);
      expect(isValidTicket(123)).toBe(false);
      expect(isValidTicket(true)).toBe(false);
    });

    it('should return false for object missing required string fields', () => {
      const incompleteTicket = {
        id: '1',
        titulo: 'Test',
        // missing descripcion, status, creatorId
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      expect(isValidTicket(incompleteTicket)).toBe(false);
    });

    it('should return false for object missing required date fields', () => {
      const incompleteTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        // missing createdAt, updatedAt
      };

      expect(isValidTicket(incompleteTicket)).toBe(false);
    });

    it('should return false for invalid status value', () => {
      const invalidStatusTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'INVALID_STATUS',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      expect(isValidTicket(invalidStatusTicket)).toBe(false);
    });

    it('should return false for date field with wrong type', () => {
      const invalidDateTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: 123456, // should be string or Date
        updatedAt: '2024-01-02T00:00:00Z',
      };

      expect(isValidTicket(invalidDateTicket)).toBe(false);
    });

    it('should accept Date objects for date fields', () => {
      const ticketWithDateObjects = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      expect(isValidTicket(ticketWithDateObjects)).toBe(true);
    });

    it('should return true for CREATED status', () => {
      const createdTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'CREATED',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      expect(isValidTicket(createdTicket)).toBe(true);
    });
  });

  describe('validateTicketResponse - Detailed Validation', () => {
    it('should return valid result for correct ticket', () => {
      const validTicket: any = {
        id: '1',
        titulo: 'Test Ticket',
        descripcion: 'A test ticket',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = validateTicketResponse(validTicket);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect missing required fields', () => {
      const incompleteTicket = {
        id: '1',
        // missing titulo, descripcion, status, creatorId
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = validateTicketResponse(incompleteTicket);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes('titulo'))).toBe(true);
      expect(result.errors.some((e) => e.includes('status'))).toBe(true);
    });

    it('should detect invalid field types', () => {
      const invalidTicket = {
        id: 123, // should be string
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = validateTicketResponse(invalidTicket);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('id') && e.includes('invalid type'))).toBe(true);
    });

    it('should detect invalid status values', () => {
      const invalidTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'UNKNOWN_STATUS',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = validateTicketResponse(invalidTicket);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('status') && e.includes('invalid value'))).toBe(true);
    });

    it('should detect invalid date formats in strings', () => {
      const invalidTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: 'not-a-date',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const result = validateTicketResponse(invalidTicket);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('createdAt') && e.includes('ISO 8601'))).toBe(true);
    });

    it('should return descriptive error messages', () => {
      const invalidTicket = {
        id: 123,
        descripcion: 'Description',
        // missing several required fields
      };

      const result = validateTicketResponse(invalidTicket);
      expect(result.errors.length).toBeGreaterThan(0);
      // Error messages should be descriptive and include field names
      result.errors.forEach((error) => {
        expect(error.length).toBeGreaterThan(5);
      });
    });

    it('should accept Date objects for date fields', () => {
      const ticketWithDates = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = validateTicketResponse(ticketWithDates);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTicketsArray', () => {
    it('should validate an array of valid tickets', () => {
      const tickets = [
        {
          id: '1',
          titulo: 'Ticket 1',
          descripcion: 'Description 1',
          status: 'PENDING',
          creatorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          titulo: 'Ticket 2',
          descripcion: 'Description 2',
          status: 'CREATED',
          creatorId: 'user2',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
        },
      ];

      const result = validateTicketsArray(tickets);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return valid result for empty array', () => {
      const result = validateTicketsArray([]);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should detect invalid items in array', () => {
      const tickets = [
        {
          id: '1',
          titulo: 'Valid Ticket',
          descripcion: 'Description',
          status: 'PENDING',
          creatorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 2, // Invalid: should be string
          titulo: 'Invalid Ticket',
          descripcion: 'Description',
          status: 'PENDING',
          creatorId: 'user2',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
        },
      ];

      const result = validateTicketsArray(tickets);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Item 1'))).toBe(true);
    });

    it('should return false for non-array input', () => {
      const result = validateTicketsArray('not an array' as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('not an array'))).toBe(true);
    });

    it('should include item index in error messages', () => {
      const tickets = [
        {
          id: '1',
          titulo: 'Valid',
          descripcion: 'Description',
          status: 'PENDING',
          creatorId: 'user1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        {
          // Missing id
          titulo: 'Invalid',
          descripcion: 'Description',
          status: 'PENDING',
          creatorId: 'user2',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-04T00:00:00Z',
        },
      ];

      const result = validateTicketsArray(tickets);
      expect(result.errors.some((e) => e.includes('Item 1'))).toBe(true);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format single error', () => {
      const errors = ['Field is required'];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toBe('Field is required');
    });

    it('should format multiple errors with line breaks', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const formatted = formatValidationErrors(errors);
      expect(formatted).toContain('3 error');
      expect(formatted).toContain('• Error 1');
      expect(formatted).toContain('• Error 2');
      expect(formatted).toContain('• Error 3');
    });

    it('should handle empty array', () => {
      const formatted = formatValidationErrors([]);
      expect(formatted).toBe('Unknown validation error');
    });

    it('should handle null or undefined', () => {
      expect(formatValidationErrors(null as any)).toBe('Unknown validation error');
      expect(formatValidationErrors(undefined as any)).toBe('Unknown validation error');
    });
  });

  describe('Coverage - Edge Cases', () => {
    it('should handle tickets with extra optional fields', () => {
      const ticketWithExtras = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        extraField: 'ignored',
        anotherExtra: 123,
      };

      expect(isValidTicket(ticketWithExtras)).toBe(true);
    });

    it('should handle edge case of fecha field in validation', () => {
      const ticketWithFecha = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'PENDING',
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        fecha: '2024-01-01',
      };

      const result = validateTicketResponse(ticketWithFecha);
      expect(result.valid).toBe(true);
    });

    it('should handle case-sensitive status values', () => {
      const lowercaseStatusTicket = {
        id: '1',
        titulo: 'Test',
        descripcion: 'Description',
        status: 'pending', // lowercase - should fail
        creatorId: 'user123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      expect(isValidTicket(lowercaseStatusTicket)).toBe(false);

      const result = validateTicketResponse(lowercaseStatusTicket);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('status'))).toBe(true);
    });
  });
});

