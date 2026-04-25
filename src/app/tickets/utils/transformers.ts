import { Ticket, CreateTicketPayload } from '../models';

/**
 * Maps API ticket data to UI format
 */
export function mapApiTicketToUi(apiTicket: Ticket): Ticket {
  return {
    ...apiTicket,
    assigned_to_name: apiTicket.assigned_to_name || 'Unassigned',
  };
}

/**
 * Maps create form data to API payload
 */
export function mapCreateFormToApi(formData: any): CreateTicketPayload {
  return {
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    status: formData.status || 'open',
    assigned_to_id: formData.assigned_to_id || null,
    assigned_to_name: formData.assigned_to_name || null,
  };
}

/**
 * Priority label mappings (canonical to localized)
 */
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

/**
 * Status label mappings (canonical to localized)
 */
export const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En progreso',
  closed: 'Cerrado',
};

/**
 * Get localized priority label
 */
export function getPriorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority] || priority;
}

/**
 * Get localized status label
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Format date for display in UI
 * Assumes ISO 8601 UTC format from API
 */
export function formatDateForDisplay(dateString: string, locale: string = 'es-ES'): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

/**
 * Truncate long text and provide tooltip-friendly version
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

