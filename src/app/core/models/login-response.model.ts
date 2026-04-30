/**
 * LoginResponse interface
 * Response structure from POST /api/auth/login endpoint
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string; // e.g., "Bearer"
  expiresIn: number; // Token expiration in seconds (typically 3600)
  username: string;
  issuedAt: number; // ISO 8601 timestamp or milliseconds
}

