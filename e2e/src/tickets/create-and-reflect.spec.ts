/**
 * E2E test: Create ticket and verify reflection in list within 5 seconds
 * This test validates the complete flow from creation to visibility in the dashboard
 */

describe('Create and Reflect - Ticket appears in list within 5 seconds', () => {
  beforeEach(() => {
    // Set up test data
    cy.visit('/tickets');

    // Wait for the dashboard to load
    cy.get('[data-testid="tickets-table"]', { timeout: 5000 }).should('exist');
  });

  it('should create a new ticket and see it in the list within 5 seconds', () => {
    // Generate unique ticket title for this test
    const ticketTitle = `Test Ticket ${Date.now()}`;

    // Click New Ticket button
    cy.get('[data-testid="btn-new-ticket"]').click();

    // Verify we're on the create page
    cy.url().should('include', '/tickets/new');

    // Fill in the create form
    cy.get('[data-testid="input-title"]').type(ticketTitle);
    cy.get('[data-testid="input-description"]').type('This is a test ticket created by E2E test');
    cy.get('[data-testid="select-priority"]').select('high');
    cy.get('[data-testid="select-status"]').select('open');

    // Submit form
    cy.get('[data-testid="btn-submit"]').click();

    // Verify we're redirected back to tickets list
    cy.url({ timeout: 3000 }).should('include', '/tickets');

    // Search for the newly created ticket in the list within 5 seconds
    // The app should poll/re-query to ensure consistency
    cy.get('[data-testid="tickets-table"]', { timeout: 5000 })
      .contains(ticketTitle)
      .should('exist');

    // Optionally verify that the ticket appears with the correct details
    cy.get('[data-testid="tickets-table"]').within(() => {
      cy.contains(ticketTitle).should('exist');
      cy.contains('Alta').should('exist'); // Priority: high -> Alta
      cy.contains('Abierto').should('exist'); // Status: open -> Abierto
    });
  });

  it('should reflect multiple created tickets in the list', () => {
    const ticket1Title = `Multi Test 1 ${Date.now()}`;
    const ticket2Title = `Multi Test 2 ${Date.now() + 1000}`;

    // Create first ticket
    cy.get('[data-testid="btn-new-ticket"]').click();
    cy.get('[data-testid="input-title"]').type(ticket1Title);
    cy.get('[data-testid="input-description"]').type('First test ticket');
    cy.get('[data-testid="select-priority"]').select('medium');
    cy.get('[data-testid="btn-submit"]').click();

    // Verify first ticket appears
    cy.url().should('include', '/tickets');
    cy.get('[data-testid="tickets-table"]', { timeout: 5000 }).contains(ticket1Title).should('exist');

    // Create second ticket
    cy.get('[data-testid="btn-new-ticket"]').click();
    cy.get('[data-testid="input-title"]').type(ticket2Title);
    cy.get('[data-testid="input-description"]').type('Second test ticket');
    cy.get('[data-testid="select-priority"]').select('low');
    cy.get('[data-testid="btn-submit"]').click();

    // Verify both tickets appear in list
    cy.url().should('include', '/tickets');
    cy.get('[data-testid="tickets-table"]', { timeout: 5000 })
      .contains(ticket2Title)
      .should('exist');

    cy.get('[data-testid="tickets-table"]').contains(ticket1Title).should('exist');
  });

  it('should handle creation with assigned user', () => {
    const ticketTitle = `Assigned Test ${Date.now()}`;

    cy.get('[data-testid="btn-new-ticket"]').click();
    cy.get('[data-testid="input-title"]').type(ticketTitle);
    cy.get('[data-testid="input-description"]').type('Assigned ticket');
    cy.get('[data-testid="select-priority"]').select('high');

    // Try to select assigned user if available
    cy.get('[data-testid="select-assigned"]').then(($select) => {
      if ($select.length > 0) {
        cy.get('[data-testid="select-assigned"]').select(0);
      }
    });

    cy.get('[data-testid="btn-submit"]').click();

    cy.url({ timeout: 3000 }).should('include', '/tickets');
    cy.get('[data-testid="tickets-table"]', { timeout: 5000 })
      .contains(ticketTitle)
      .should('exist');
  });
});

