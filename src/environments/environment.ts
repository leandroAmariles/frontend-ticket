/**
 * Environment configuration for development
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8090/api',
  // Relative path — proxied to backend-ia (http://localhost:8092) by proxy.conf.json
  // during `ng serve`, since backend-ia has no CORS configuration of its own.
  knowledgeApiBaseUrl: '/api/v1/knowledge',
  // Re-query strategy defaults (from plan.md)
  reQuery: {
    initialInterval: 500, // ms
    maxInterval: 2000, // ms
    maxDuration: 5000, // ms (5 seconds)
    backoffMultiplier: 2,
  },
};

