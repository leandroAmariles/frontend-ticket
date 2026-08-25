/**
 * Environment configuration for production
 */
export const environment = {
  production: true,
  // Relative/same-origin on purpose: TicketsApiService/AuthService's endpoint
  // constants already start with "/api/..." (e.g. "/api/v1/tickets/all"), and
  // the Ingress routes that exact /api prefix to backend-ticket (see
  // ssd-infra/base/ingress.yaml) — so leaving this empty resolves requests
  // against whatever origin the app is served from, instead of the fake
  // "https://api.example.com" domain this used to be.
  apiBaseUrl: '',
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

