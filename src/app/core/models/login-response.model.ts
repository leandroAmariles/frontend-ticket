/**
 * LoginResponse interface
 * Response structure from POST /api/auth/login endpoint
 * The backend may return the token either as `accessToken` or `token` — both are supported.
 */
export interface LoginResponse {
  accessToken?: string; // JWT token — primary field name per API contract
  token?: string;       // JWT token — alternate field name (some backend versions)
  tokenType: string;    // e.g., "Bearer"
  expiresIn: number;    // Token expiration in seconds (typically 3600)
  username: string;
  issuedAt: number;     // Unix timestamp in seconds
}

