import {
  mapApiTicketToUi,
  mapCreateFormToApi,
  getStatusLabel,
  formatDateForDisplay,
  truncateText,
} from '../../utils/transformers';
import { Ticket } from '../../models';

describe('Transformers', () => {
  describe('mapApiTicketToUi', () => {
    it('should map API ticket to UI format, preserving all fields', () => {
      const apiTicket: Ticket = {
        id: '123',
        titulo: 'Test Ticket',
        descripcion: 'Test Description',
        status: 'PENDING',
        creatorId: 'user-123',
        fecha: '2026-04-25T10:15:30Z',
        createdAt: '2026-04-25T10:15:30Z',
      };

      const uiTicket = mapApiTicketToUi(apiTicket);

      expect(uiTicket).toEqual(apiTicket);
      expect(uiTicket).not.toBe(apiTicket); // returns a copy, not the same reference
    });

    it('should preserve a null creatorId (unassigned ticket)', () => {
      const apiTicket: Ticket = {
        id: '123',
        titulo: 'Test Ticket',
        descripcion: 'Test Description',
        status: 'PENDING',
        creatorId: null,
        fecha: '2026-04-25T10:15:30Z',
        createdAt: '2026-04-25T10:15:30Z',
      };

      const uiTicket = mapApiTicketToUi(apiTicket);

      expect(uiTicket.creatorId).toBeNull();
    });
  });

  describe('mapCreateFormToApi', () => {
    it('should map form data to the CreateTicketPayload API shape', () => {
      const formData = {
        titulo: 'New Ticket',
        descripcion: 'Description',
        fecha: '2026-04-25T10:15:30Z',
      };

      const payload = mapCreateFormToApi(formData);

      expect(payload.titulo).toBe('New Ticket');
      expect(payload.descripcion).toBe('Description');
      expect(payload.fecha).toBe(new Date(formData.fecha).toISOString());
    });

    it('should default fecha to the current UTC time when not provided', () => {
      const before = Date.now();
      const formData = {
        titulo: 'New Ticket',
        descripcion: 'Description',
      };

      const payload = mapCreateFormToApi(formData);
      const after = Date.now();

      const fechaMs = new Date(payload.fecha).getTime();
      expect(fechaMs).toBeGreaterThanOrEqual(before);
      expect(fechaMs).toBeLessThanOrEqual(after);
    });
  });

  describe('Status labels', () => {
    it('should return localized status labels', () => {
      expect(getStatusLabel('PENDING')).toBe('Pendiente');
      expect(getStatusLabel('CREATED')).toBe('Creado');
    });

    it('should return original value if label not found', () => {
      expect(getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format ISO 8601 date to localized string', () => {
      const isoDate = '2026-04-25T10:15:30Z';
      const formatted = formatDateForDisplay(isoDate, 'en-US');

      // Result will vary based on locale
      expect(formatted).toContain('04');
      expect(formatted).toContain('25');
      expect(formatted).toContain('2026');
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = 'invalid-date';
      const result = formatDateForDisplay(invalidDate);

      expect(result).toBe('invalid-date');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 20);

      expect(truncated.length).toBeLessThanOrEqual(20);
      expect(truncated).toContain('...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = truncateText(shortText, 20);

      expect(result).toBe('Short text');
    });

    it('should use default max length of 50', () => {
      const text = 'a'.repeat(100);
      const result = truncateText(text);

      expect(result.length).toBeLessThanOrEqual(50);
    });
  });
});
