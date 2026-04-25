import {
  mapApiTicketToUi,
  mapCreateFormToApi,
  getPriorityLabel,
  getStatusLabel,
  formatDateForDisplay,
  truncateText,
} from '../../utils/transformers';
import { Ticket, CreateTicketPayload } from '../../models';

describe('Transformers', () => {
  describe('mapApiTicketToUi', () => {
    it('should map API ticket to UI format', () => {
      const apiTicket: Ticket = {
        id: '123',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'high',
        status: 'open',
        assigned_to_id: 'user-123',
        assigned_to_name: 'John Doe',
        created_at: '2026-04-25T10:15:30Z',
      };

      const uiTicket = mapApiTicketToUi(apiTicket);

      expect(uiTicket.id).toBe('123');
      expect(uiTicket.title).toBe('Test Ticket');
      expect(uiTicket.assigned_to_name).toBe('John Doe');
    });

    it('should set assigned_to_name to Unassigned when null', () => {
      const apiTicket: Ticket = {
        id: '123',
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'high',
        status: 'open',
        assigned_to_id: null,
        assigned_to_name: null,
        created_at: '2026-04-25T10:15:30Z',
      };

      const uiTicket = mapApiTicketToUi(apiTicket);

      expect(uiTicket.assigned_to_name).toBe('Unassigned');
    });
  });

  describe('mapCreateFormToApi', () => {
    it('should map form data to API payload', () => {
      const formData = {
        title: 'New Ticket',
        description: 'Description',
        priority: 'medium',
        status: 'open',
        assigned_to_id: 'user-123',
        assigned_to_name: 'Jane Doe',
      };

      const payload = mapCreateFormToApi(formData);

      expect(payload.title).toBe('New Ticket');
      expect(payload.description).toBe('Description');
      expect(payload.priority).toBe('medium');
      expect(payload.assigned_to_id).toBe('user-123');
    });

    it('should set status to open by default', () => {
      const formData = {
        title: 'New Ticket',
        description: 'Description',
        priority: 'low',
      };

      const payload = mapCreateFormToApi(formData);

      expect(payload.status).toBe('open');
    });

    it('should handle missing assigned_to fields', () => {
      const formData = {
        title: 'New Ticket',
        description: 'Description',
        priority: 'high',
      };

      const payload = mapCreateFormToApi(formData);

      expect(payload.assigned_to_id).toBeNull();
      expect(payload.assigned_to_name).toBeNull();
    });
  });

  describe('Priority labels', () => {
    it('should return localized priority labels', () => {
      expect(getPriorityLabel('low')).toBe('Baja');
      expect(getPriorityLabel('medium')).toBe('Media');
      expect(getPriorityLabel('high')).toBe('Alta');
    });

    it('should return original value if label not found', () => {
      expect(getPriorityLabel('unknown')).toBe('unknown');
    });
  });

  describe('Status labels', () => {
    it('should return localized status labels', () => {
      expect(getStatusLabel('open')).toBe('Abierto');
      expect(getStatusLabel('in_progress')).toBe('En progreso');
      expect(getStatusLabel('closed')).toBe('Cerrado');
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

