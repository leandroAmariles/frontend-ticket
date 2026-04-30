/**
 * E2E tests for authentication and ticket loading flow
 *
 * T044: E2E test for auth and tickets loading flow with Cypress
 * Tests the complete user journey from login through ticket display
 */

describe('Auth and Tickets Flow E2E (T044)', () => {
  const baseUrl = 'http://localhost:4200';
  const backendUrl = 'http://localhost:8080';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit(`${baseUrl}/login`);
  });

  it('should navigate to login if not authenticated', () => {
    // Verify we're on login page
    cy.url().should('include', '/login');
    cy.contains('h1', /login|sign in/i).should('be.visible');
  });

  it('should login with valid credentials and redirect to dashboard', () => {
    // Intercept login request
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'test-jwt-token-12345',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'testuser',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    // Fill in login form
    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('testuser');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('testpassword');

    // Submit login form
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    // Verify login request was made
    cy.wait('@loginRequest');

    // Should redirect to dashboard/tickets
    cy.url().should('include', '/tickets');

    // Verify token is stored in localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.exist;
      expect(token).to.include('testuser');
    });
  });

  it('should load and display tickets after successful login', () => {
    // Intercept both login and tickets requests
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: 'test-token-xyz',
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'testuser',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, {
      statusCode: 200,
      body: {
        items: [
          {
            id: '1',
            titulo: 'Fix login button',
            descripcion: 'The login button is unresponsive',
            status: 'PENDING',
            creatorId: 'user123',
            fecha: '2024-01-01',
            createdAt: '2024-01-01T10:00:00Z',
            updatedAt: '2024-01-01T10:00:00Z',
          },
          {
            id: '2',
            titulo: 'Update documentation',
            descripcion: 'API docs need updating',
            status: 'CREATED',
            creatorId: 'user456',
            fecha: '2024-01-02',
            createdAt: '2024-01-02T14:30:00Z',
            updatedAt: '2024-01-02T14:30:00Z',
          },
        ],
        page: 0,
        size: 20,
        total: 2,
        totalPages: 1,
      },
    }).as('getTicketsRequest');

    // Login
    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('testuser');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('testpass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@loginRequest');
    cy.wait('@getTicketsRequest');

    // Verify on tickets page
    cy.url().should('include', '/tickets');

    // Verify tickets are displayed
    cy.contains('Fix login button').should('be.visible');
    cy.contains('Update documentation').should('be.visible');

    // Verify table has correct data
    cy.get('table tbody tr').should('have.length', 2);
    cy.get('table tbody tr:first').should('contain', 'Fix login button');
    cy.get('table tbody tr:last').should('contain', 'Update documentation');
  });

  it('should show error message on login failure', () => {
    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('failedLoginRequest');

    cy.get('input[type="text"], input[placeholder*="username"], input[id*="username"]')
      .first()
      .type('baduser');
    cy.get('input[type="password"], input[placeholder*="password"], input[id*="password"]')
      .first()
      .type('wrongpass');
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign in")')
      .first()
      .click();

    cy.wait('@failedLoginRequest');

    // Verify error message is displayed
    cy.contains(/invalid|failed|credentials/i).should('be.visible');

    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should include Authorization header in API requests', () => {
    const token = 'test-token-with-auth-header';

    cy.intercept('POST', `${backendUrl}/api/auth/login`, {
      statusCode: 200,
      body: {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: 3600,
        username: 'testuser',
        issuedAt: new Date().getTime(),
      },
    }).as('loginRequest');

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, (req) => {
      // Verify Authorization header is present
      expect(req.headers['authorization']).to.equal(`Bearer ${token}`);
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

    // Verify request was made with correct header
    cy.get('@getTicketsRequest').should((xhr) => {
      expect(xhr.request.headers.authorization).to.equal(`Bearer ${token}`);
    });
  });

  it('should show loading spinner while fetching tickets', () => {
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

    cy.intercept('GET', `${backendUrl}/api/v1/tickets/all*`, (req) => {
      // Delay response to see loading state
      req.reply((res) => {
        res.delay(1000);
        res.send({
          statusCode: 200,
          body: {
            items: [],
            page: 0,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        });
      });
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

    // Look for loading indicator
    cy.contains(/loading|please wait/i).should('be.visible');

    cy.wait('@getTicketsRequest');
  });

  it('should handle empty tickets list gracefully', () => {
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
        items: [],
        page: 0,
        size: 20,
        total: 0,
        totalPages: 0,
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

    // Should show empty state message or empty table
    cy.get('table tbody tr').should('have.length', 0);
    cy.contains(/no tickets|empty/i).should('be.visible');
  });
});

