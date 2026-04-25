/**
 * E2E test scaffold for tickets dashboard
 * Tests the primary user flows: listing, creating, and filtering tickets
 */

describe('Tickets Dashboard E2E', () => {
  beforeEach(() => {
    // Set up test environment
    cy.visit('/tickets');
  });

  describe('Dashboard Load', () => {
    it('should load the tickets dashboard', () => {
      cy.get('[data-testid="tickets-table"]').should('exist');
    });

    it('should display the New Ticket button', () => {
      cy.get('[data-testid="btn-new-ticket"]').should('be.visible');
    });
  });

  describe('Create and Reflect', () => {
    it('should create a ticket and see it in the list within 5 seconds', () => {
      // Click New Ticket button
      cy.get('[data-testid="btn-new-ticket"]').click();

      // Fill in the form
      cy.get('[data-testid="input-title"]').type('Test Ticket');
      cy.get('[data-testid="input-description"]').type('This is a test ticket');
      cy.get('[data-testid="select-priority"]').select('high');

      // Submit form
      cy.get('[data-testid="btn-submit"]').click();

      // Should redirect to /tickets
      cy.url().should('include', '/tickets');

      // Verify ticket appears in the list within 5 seconds
      cy.get('[data-testid="tickets-table"]', { timeout: 5000 }).contains('Test Ticket').should('exist');
    });
  });

  describe('Pagination', () => {
    it('should change page size', () => {
      cy.get('[data-testid="paginator-page-size"]').select('50');
      cy.get('[data-testid="paginator"]').should('contain', '50');
    });
  });

  describe('Filtering', () => {
    it('should filter by priority', () => {
      cy.get('[data-testid="filter-priority"]').select('high');
      cy.get('[data-testid="tickets-table"]').should('contain', 'Alta');
    });

    it('should filter by status', () => {
      cy.get('[data-testid="filter-status"]').select('open');
      cy.get('[data-testid="tickets-table"]').should('contain', 'Abierto');
    });
  });
});

