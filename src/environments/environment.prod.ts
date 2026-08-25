/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.example.com/api',
  // NOTE: no CORS/reverse-proxy exists in front of backend-ia yet for production —
  // this needs a real routing solution before the admin RAG panel works outside dev.
  knowledgeApiBaseUrl: 'https://api.example.com/api/v1/knowledge',
  // Re-query strategy defaults (from plan.md)
  reQuery: {
    initialInterval: 500, // ms
    maxInterval: 2000, // ms
    maxDuration: 5000, // ms (5 seconds)
    backoffMultiplier: 2,
  },
};

