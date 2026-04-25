/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com/api',
  // Re-query strategy defaults (from plan.md)
  reQuery: {
    initialInterval: 500, // ms
    maxInterval: 2000, // ms
    maxDuration: 5000, // ms (5 seconds)
    backoffMultiplier: 2,
  },
};

