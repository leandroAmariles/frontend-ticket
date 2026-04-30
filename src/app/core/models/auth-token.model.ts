/**
 * AuthToken interface
 * Represents the authentication token structure stored in localStorage
 */
export interface AuthToken {
  accessToken: string;
  tokenType: string; // e.g., "Bearer"
  expiresIn: number; // Token lifetime in seconds (typically 3600)
  username: string;
  issuedAt: number; // Timestamp when token was issued (milliseconds since epoch)
}

