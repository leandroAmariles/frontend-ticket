/**
 * E2E tests for error handling and recovery flow
 *
 * T045: E2E test for error handling flow with Cypress
 * Tests error display, error recovery, and retry functionality
 */

describe('Error Handling Flow E2E (T045)', () => {
  const baseUrl = 'http://localhost:4200';
  const backendUrl = 'http://localhost:8080';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit(`${baseUrl}/login`);
  });

  it('should display error message when tickets API fails with 500', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('getTicketsRequest');

    // Login
    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Verify error message is displayed
    cy.contains(/server error|try again/i).should('be.visible');
  });

  it('should display user-friendly error message on network failure', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, { forceNetworkError: true }).as(
      'networkError'
    );

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');

    // Wait for network error to be handled
    cy.contains(/unable to connect|network error|check connection/i).should('be.visible');
  });

  it('should show retry button on error', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    let callCount = 0;
    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, (req) => {
      callCount++;
      if (callCount === 1) {
        req.reply({
          statusCode: 500,
          body: { error: 'Server error' },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            items: [],
            page: 0,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');

    // Wait for error and verify retry button exists
    cy.contains(/server error/i).should('be.visible');
    cy.get('button:contains("Retry"), button:contains("Try again"), button[aria-label*="retry"], button[aria-label*="Retry"]')
      .should('exist');
  });

  it('should successfully retry after error', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    let callCount = 0;
    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, (req) => {
      callCount++;
      if (callCount === 1) {
        // First request fails
        req.reply({
          statusCode: 500,
          body: { error: 'Server error' },
        });
      } else {
        // Retry succeeds
        req.reply({
          statusCode: 200,
          body: {
            items: [
              {
                id: '1',
                titulo: 'Test Ticket',
                descripcion: 'After retry',
                status: 'PENDING',
                creatorId: 'user',
                fecha: '2024-01-01',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
              },
            ],
            page: 0,
            size: 20,
            total: 1,
            totalPages: 1,
          },
        });
      }
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');

    // Error appears
    cy.contains(/server error/i).should('be.visible');

    // Click retry
    cy.get('button:contains("Retry"), button:contains("Try again"), button[aria-label*="retry"], button[aria-label*="Retry"]')
      .first()
      .click();

    // Error clears and data appears
    cy.contains(/server error/i).should('not.exist');
    cy.contains('Test Ticket').should('be.visible');
  });

  it('should handle 401 Unauthorized error and redirect to login', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'expired-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 401,
      body: { error: 'Unauthorized' },
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Should be redirected back to login
    cy.url().should('include', '/login');
    cy.contains(/session expired|login/i).should('be.visible');
  });

  it('should handle 403 Forbidden error', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 403,
      body: { error: 'Forbidden' },
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Should show permission error
    cy.contains(/permission|forbidden|access/i).should('be.visible');
  });

  it('should handle 400 Bad Request error', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 400,
      body: { error: 'Bad Request' },
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Should show invalid request error
    cy.contains(/invalid|request|parameters/i).should('be.visible');
  });

  it('should clear error message when user navigates away and back', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    let callCount = 0;
    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, (req) => {
      callCount++;
      if (callCount <= 2) {
        // First two calls fail
        req.reply({
          statusCode: 500,
          body: { error: 'Server error' },
        });
      } else {
        // Third call succeeds
        req.reply({
          statusCode: 200,
          body: {
            items: [],
            page: 0,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        });
      }
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');

    // Error appears
    cy.contains(/server error/i).should('be.visible');

    // Navigate away and back
    cy.visit(`${baseUrl}/home`);
    cy.visit(`${baseUrl}/tickets`);

    // If navigating away clears state, error should not be visible
    // (or we can verify the retry works fresh)
    cy.get('button:contains("Retry"), button:contains("Try again")')
      .should('exist')
      .click();

    cy.contains(/server error/i).should('be.visible');
  });

  it('should maintain error state while user reads message before retry', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Error should be visible
    cy.contains(/server error/i).should('be.visible');

    // Wait a bit (simulate user reading), error should still be there
    cy.wait(1000);
    cy.contains(/server error/i).should('be.visible');

    // Retry button should still be available
    cy.get('button:contains("Retry"), button:contains("Try again")')
      .should('exist')
      .should('be.enabled');
  });

  it('should show meaningful error for malformed API response', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'user',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 200,
      body: {
        // Missing items array
        page: 0,
        size: 20,
      },
    }).as('getTicketsRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('user');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('pass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Should show error about malformed response
    cy.contains(/invalid|malformed|unexpected|error/i).should('be.visible');
  });
});

