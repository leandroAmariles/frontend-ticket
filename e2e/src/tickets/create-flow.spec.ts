/**
 * E2E test: Complete create ticket flow
 * Tests the full journey from navigation to confirmation
 */

describe('Create Ticket Flow - E2E', () => {
  beforeEach(() => {
    cy.visit('/tickets');
  });

  describe('Create Ticket Form Navigation', () => {
    it('should navigate to create page when clicking New Ticket button', () => {
      cy.get('[data-testid="btn-new-ticket"]').click();
      cy.url().should('include', '/tickets/new');
      cy.get('[data-testid="input-title"]').should('exist');
    });

    it('should display empty form on create page', () => {
      cy.visit('/tickets/new');

      // Form should be empty
      cy.get('[data-testid="input-title"]').should('have.value', '');
      cy.get('[data-testid="input-description"]').should('have.value', '');

      // Default values should be set
      cy.get('[data-testid="select-priority"]').should('have.value', 'medium');
      cy.get('[data-testid="select-status"]').should('have.value', 'open');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      cy.visit('/tickets/new');
    });

    it('should disable submit button when form is invalid', () => {
      // All fields empty
      cy.get('[data-testid="btn-submit"]').should('be.disabled');

      // Add title only
      cy.get('[data-testid="input-title"]').type('New Ticket');
      cy.get('[data-testid="btn-submit"]').should('be.disabled');

      // Add description
      cy.get('[data-testid="input-description"]').type('This is a valid description');
      cy.get('[data-testid="btn-submit"]').should('not.be.disabled');
    });

    it('should show validation error for short title', () => {
      cy.get('[data-testid="input-title"]').type('ab');
      cy.get('[data-testid="input-title"]').blur();

      // Error message should appear (if mat-error is visible)
      cy.contains('Title must be at least 3 characters').should('exist');
    });

    it('should show validation error for short description', () => {
      cy.get('[data-testid="input-title"]').type('Valid Title');
      cy.get('[data-testid="input-description"]').type('test');
      cy.get('[data-testid="input-description"]').blur();

      cy.contains('Description must be at least 5 characters').should('exist');
    });

    it('should enable submit when all required fields are valid', () => {
      cy.get('[data-testid="input-title"]').type('Valid Ticket Title');
      cy.get('[data-testid="input-description"]').type('This is a valid description');

      cy.get('[data-testid="btn-submit"]').should('not.be.disabled');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', () => {
      cy.visit('/tickets/new');

      const ticketTitle = `Form Submit Test ${Date.now()}`;

      cy.get('[data-testid="input-title"]').type(ticketTitle);
      cy.get('[data-testid="input-description"]').type('A detailed description of the issue');
      cy.get('[data-testid="select-priority"]').select('high');
      cy.get('[data-testid="select-status"]').select('in_progress');

      // Submit form
      cy.get('[data-testid="btn-submit"]').click();

      // Should be redirected to /tickets
      cy.url({ timeout: 5000 }).should('include', '/tickets');

      // Verify ticket appears in list
      cy.get('[data-testid="tickets-table"]', { timeout: 5000 })
        .contains(ticketTitle)
        .should('exist');
    });

    it('should show success message after submission', () => {
      cy.visitCreatePage();

      cy.get('[data-testid="input-title"]').type('Success Test Ticket');
      cy.get('[data-testid="input-description"]').type('Testing success message');
      cy.get('[data-testid="btn-submit"]').click();

      // Success message should appear
      cy.contains('created successfully', { matchCase: false }).should('exist');
    });
  });

  describe('Form Cancellation', () => {
    it('should navigate back when clicking Cancel button', () => {
      cy.visit('/tickets/new');

      cy.get('[data-testid="btn-cancel"]').click();

      cy.url().should('include', '/tickets');
    });

    it('should not submit form data when clicking Cancel', () => {
      cy.visit('/tickets/new');

      cy.get('[data-testid="input-title"]').type('Cancelled Ticket');
      cy.get('[data-testid="input-description"]').type('This should not be created');
      cy.get('[data-testid="btn-cancel"]').click();

      // The ticket should not appear in the list
      cy.get('[data-testid="tickets-table"]').should('not.contain', 'Cancelled Ticket');
    });
  });

  describe('Error Handling', () => {
    it('should show error message on creation failure', () => {
      cy.visit('/tickets/new');

      // Create a ticket with invalid data that will fail
      cy.get('[data-testid="input-title"]').type('Error Test');
      cy.get('[data-testid="input-description"]').type('This will cause an error');

      // Intercept API call and make it fail
      cy.intercept('POST', '**/api/tickets', {
        statusCode: 400,
        body: { message: 'Validation failed' },
      });

      cy.get('[data-testid="btn-submit"]').click();

      // Error message should appear
      cy.contains('Failed to create ticket', { matchCase: false }).should('exist');

      // Form should remain visible
      cy.get('[data-testid="input-title"]').should('exist');
    });
  });

  /**
   * Helper command to navigate to create page
   */
});

