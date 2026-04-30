/**
 * Ticket Validators
 * Utility functions for validating ticket objects and API responses
 *
 * Provides type guards and validation functions to ensure ticket data
 * conforms to the expected Ticket interface before rendering or processing
 */

import { Ticket } from '../models';

/**
 * Type guard to check if an object is a valid Ticket
 * Validates that object has all required fields with correct types
 *
 * @param obj - Object to validate
 * @returns true if object is a valid Ticket, false otherwise
 */
export function isValidTicket(obj: any): obj is Ticket {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Check required string fields
  const requiredStringFields = ['id', 'titulo', 'descripcion', 'status', 'creatorId'];
  for (const field of requiredStringFields) {
    if (typeof obj[field] !== 'string') {
      return false;
    }
  }

  // Check required date fields (should be string ISO format or Date)
  const requiredDateFields = ['createdAt', 'updatedAt'];
  for (const field of requiredDateFields) {
    if (!(typeof obj[field] === 'string' || obj[field] instanceof Date)) {
      return false;
    }
  }

  // Validate status enum values
  const validStatuses = ['PENDING', 'CREATED'];
  if (!validStatuses.includes(obj.status)) {
    return false;
  }

  // Optional fields (we allow them to exist but don't require them)
  // fecha, descripcion variations, etc.

  return true;
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a ticket response object and return detailed validation results
 * Useful for comprehensive error reporting
 *
 * @param response - Raw object to validate
 * @returns ValidationResult with valid flag and error messages
 */
export function validateTicketResponse(response: any): ValidationResult {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('Response is not a valid object');
    return { valid: false, errors };
  }

  // Validate required string fields
  const requiredStringFields: (keyof Ticket)[] = [
    'id',
    'titulo',
    'descripcion',
    'status',
    'creatorId',
  ];

  for (const field of requiredStringFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: "${field}"`);
    } else if (typeof response[field] !== 'string') {
      errors.push(
        `Field "${field}" has invalid type: expected string, got ${typeof response[field]}`
      );
    }
  }

  // Validate required date fields
  const requiredDateFields: (keyof Ticket)[] = ['createdAt', 'updatedAt'];
  for (const field of requiredDateFields) {
    if (!(field in response)) {
      errors.push(`Missing required field: "${field}"`);
    } else if (!(typeof response[field] === 'string' || response[field] instanceof Date)) {
      errors.push(
        `Field "${field}" has invalid type: expected ISO string or Date, got ${typeof response[field]}`
      );
    }
  }

  // Validate status enum value
  if ('status' in response) {
    const validStatuses = ['PENDING', 'CREATED'];
    if (!validStatuses.includes(response.status)) {
      errors.push(
        `Field "status" has invalid value: "${response.status}". Expected one of: ${validStatuses.join(
          ', '
        )}`
      );
    }
  }

  // Check for date format if createdAt or updatedAt are strings
  const dateFields = ['createdAt', 'updatedAt'];
  for (const field of dateFields) {
    if (typeof response[field] === 'string') {
      // Basic ISO 8601 check
      if (!/^\d{4}-\d{2}-\d{2}/.test(response[field])) {
        errors.push(
          `Field "${field}" is not in ISO 8601 format: "${response[field]}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an array of tickets
 * Checks each ticket in the array and returns all validation errors
 *
 * @param tickets - Array of ticket objects to validate
 * @returns ValidationResult with cumulative errors
 */
export function validateTicketsArray(tickets: any[]): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(tickets)) {
    errors.push('Input is not an array');
    return { valid: false, errors };
  }

  if (tickets.length === 0) {
    // Empty array is valid
    return { valid: true, errors: [] };
  }

  // Validate each ticket
  for (let i = 0; i < tickets.length; i++) {
    const result = validateTicketResponse(tickets[i]);
    if (!result.valid) {
      const ticketErrors = result.errors.map((err) => `[Item ${i}] ${err}`);
      errors.push(...ticketErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors as a user-friendly message
 *
 * @param errors - Array of validation error strings
 * @returns User-friendly error message
 */
export function formatValidationErrors(errors: string[]): string {
  if (!errors || errors.length === 0) {
    return 'Unknown validation error';
  }

  if (errors.length === 1) {
    return errors[0];
  }

  // For multiple errors, join with line breaks and provide context
  return `Validation failed with ${errors.length} error(s):\n${errors.map((e) => `• ${e}`).join('\n')}`;
}

