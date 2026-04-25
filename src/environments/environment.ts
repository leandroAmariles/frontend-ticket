/**
 * Environment configuration for development
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  // Re-query strategy defaults (from plan.md)
  reQuery: {
    initialInterval: 500, // ms
    maxInterval: 2000, // ms
    maxDuration: 5000, // ms (5 seconds)
    backoffMultiplier: 2,
  },
};

