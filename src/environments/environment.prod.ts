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
  // Relative, same reasoning as apiBaseUrl above: the Ingress now has a
  // dedicated rule (ssd-infra/base/ingress-ia.yaml) that strips the /ia
  // prefix before forwarding to backend-ia, whose own routes start at
  // /api/v1/knowledge with no /ia of their own.
  knowledgeApiBaseUrl: '/ia/api/v1/knowledge',
  // Re-query strategy defaults (from plan.md)
  reQuery: {
    initialInterval: 500, // ms
    maxInterval: 2000, // ms
    maxDuration: 5000, // ms (5 seconds)
    backoffMultiplier: 2,
  },
};

