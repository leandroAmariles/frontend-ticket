import { Ticket, CreateTicketPayload } from '../models';

/**
 * Maps API ticket data to UI format
 * Currently a pass-through as API format matches UI format
 */
export function mapApiTicketToUi(apiTicket: Ticket): Ticket {
  return { ...apiTicket };
}

/**
 * Maps create form data to API payload
 * Backend expects: fecha (ISO-8601), titulo, descripcion
 * If fecha is not provided, defaults to current UTC time
 */
export function mapCreateFormToApi(formData: any): CreateTicketPayload {
  const fecha = formData.fecha
    ? new Date(formData.fecha).toISOString()
    : new Date().toISOString();
  return {
    fecha,
    titulo: formData.titulo,
    descripcion: formData.descripcion,
  };
}

/**
 * Status label mappings for backend values
 */
export const STATUS_LABELS: Record<string, string> = {
  'PENDING': 'Pendiente',
  'CREATED': 'Creado',
};

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
export function formatDateForDisplay(dateString: string, locale = 'es-ES'): string {
  try {
    const date = new Date(dateString);
    // If date is invalid, return original input
    if (isNaN(date.getTime())) {
      return dateString;
    }

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
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

