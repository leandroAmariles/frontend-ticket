/**
 * Environment configuration for development
 */
export const environment = {
  production: false,
  // Matches the hardcoded base URL TicketsApiService/AuthService used before
  // they read from environment — backend-ticket run locally (docker-compose)
  // on 8080.
  apiBaseUrl: 'http://localhost:8080',
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

