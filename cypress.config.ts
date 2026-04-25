/**
 * Cypress configuration file for tickets e2e tests
 * Ensures proper baseUrl, viewport settings, and API mocking configuration
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: 'e2e/src/**/*.spec.ts',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Implement node event listeners here if needed
    },
  },
});

