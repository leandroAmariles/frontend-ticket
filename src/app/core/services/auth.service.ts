import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthToken, LoginRequest } from '../models';
import { decodeJwtPayload } from '../utils/jwt.util';

/**
 * Authentication Service
 * Manages user authentication, token storage and retrieval, and token validation
 *
 * **Purpose**: This service is the single source of truth for authentication state.
 * It handles the complete token lifecycle from login through expiration detection.
 *
 * **Key Responsibilities**:
 * - Login: POST credentials to /api/auth/login, store returned JWT
 * - Logout: Clear token from storage and update auth state
 * - Token Management: Get/Set tokens in localStorage
 * - Token Validation: Check token expiration with clock skew buffer
 * - Session Management: Calculate remaining time and check expiration
 * - State Broadcasting: Emit auth state changes via isAuthenticated$ observable
 *
 * **Backend Endpoint**:
 * - POST `http://localhost:8080/api/auth/login`
 *   - Request: `{username: string, password: string}`
 *   - Response: `{accessToken, tokenType: "Bearer", expiresIn: 3600, username, issuedAt}`
 *
 * **Token Storage**:
 * Tokens are stored in browser's localStorage (synchronously accessible):
 * - `auth_token`: JSON stringified AuthToken object
 * - `auth_token_expiration`: Timestamp (milliseconds) when token expires
 *
 * **Token Format**:
 * JWTs (JSON Web Tokens) contain three base64url-encoded parts:
 * 1. Header: Algorithm (HS256) and type (JWT)
 * 2. Payload: Claims (username, issuedAt, expiresIn)
 * 3. Signature: Ensures token wasn't tampered with
 * Format: `header.payload.signature`
 *
 * **Expiration Handling**:
 * Tokens include:
 * - `issuedAt`: Timestamp when token was created
 * - `expiresIn`: Seconds until expiration (e.g., 3600 = 1 hour)
 * - We calculate: expiration = issuedAt + (expiresIn * 1000ms)
 * - We apply 60-second buffer for clock skew (server/client time drift)
 * - Example: Token issued at 12:00, expires in 3600s (1 hr), actual expiry: 1:00 - 60s = 12:59
 *
 * **Observable Pattern**:
 * `isAuthenticated$` broadcasts auth state changes:
 * - Login success: emits `true`
 * - Logout or expiration: emits `false`
 * - Components subscribe to update UI (show/hide login button, etc.)
 *
 * **Error Handling**:
 * - Network errors: Observable throws with HttpErrorResponse
 * - Storage errors: Caught silently, logged to console (e.g., localStorage full)
 * - Corrupted data: Safe fallback (isTokenValid returns false)
 *
 * **Example Usage**:
 * ```typescript
 * // In login component:
 * onSubmit(credentials: LoginRequest) {
 *   this.authService.login(credentials.username, credentials.password).subscribe(
 *     (token) => {
 *       console.log('Login successful for:', token.username);
 *       this.router.navigate(['/tickets']);
 *     },
 *     (error) => console.error('Login failed:', error)
 *   );
 * }
 *
 * // In app.component.ts:
 * isAuthenticated$ = this.authService.isAuthenticated$;
 *
 * // In template:
 * <button *ngIf="isAuthenticated$ | async">Logout</button>
 * <button *ngIf="!(isAuthenticated$ | async)">Login</button>
 * ```
 *
 * **Token Flow**:
 * 1. User enters credentials → login(username, password)
 * 2. HTTP POST to /api/auth/login with credentials
 * 3. Backend validates credentials, returns JWT token
 * 4. We parse response, extract accessToken, calculate expiration
 * 5. Store token in localStorage
 * 6. Emit isAuthenticated$ = true
 * 7. AuthInterceptor uses getToken() for all API requests
 * 8. Token persists across page refreshes (localStorage survives)
 * 9. On component init, can check isTokenValid() to restore auth state
 * 10. When token expires or 401 returned, logout() clears token
 * 11. Emit isAuthenticated$ = false
 * 12. App redirects to login page
 *
 * @service Provided in 'root' to ensure singleton instance
 * @see AuthInterceptor for automatic header injection
 * @see Token expiration calculation in setToken() method
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRATION_KEY = 'auth_token_expiration';
  private readonly API_BASE_URL = 'http://localhost:8080';
  private readonly LOGIN_ENDPOINT = '/api/auth/login';

  // Observable to track authentication state changes
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenValid());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password
   * Stores the returned token in localStorage upon success
   *
   * @param username - User login username
   * @param password - User login password
   * @returns Observable<AuthToken> - Token information
   * @throws HttpErrorResponse if login fails (401, 400, etc.)
   */
  login(username: string, password: string): Observable<AuthToken> {
    const loginRequest: LoginRequest = { username, password };
    return this.http
      .post<any>(`${this.API_BASE_URL}${this.LOGIN_ENDPOINT}`, loginRequest)
      .pipe(
        map((response): AuthToken => {
          // Support both 'accessToken' and 'token' field names from backend
          const rawToken = response.accessToken || response.token;
          console.debug('[AuthService] Login response fields:', {
            hasAccessToken: !!response.accessToken,
            hasToken: !!response.token,
            tokenType: response.tokenType,
            expiresIn: response.expiresIn,
            username: response.username,
            issuedAt: response.issuedAt,
          });

          if (!rawToken) {
            throw new Error('[AuthService] Backend response missing both "accessToken" and "token" fields');
          }

          const authToken: AuthToken = {
            accessToken: rawToken,
            tokenType: response.tokenType || 'Bearer',
            expiresIn: response.expiresIn || 3600,
            username: response.username,
            issuedAt: this.getIssuedAtTimestamp(response.issuedAt),
          };
          this.setToken(authToken);
          this.isAuthenticatedSubject.next(true);
          return authToken;
        })
      );
  }

  /**
   * Logout the current user
   * Clears token from storage and updates authentication state
   */
  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRATION_KEY);
      this.isAuthenticatedSubject.next(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Get the current authentication token
   * Returns null if token is expired or not found
   *
   * @returns The access token string or null
   */
  getToken(): string | null {
    if (!this.isTokenValid()) {
      return null;
    }
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const authToken: AuthToken = JSON.parse(tokenData);

      // Defensive check: if accessToken is missing the stored data is corrupt
      // (e.g. saved by an older version of the frontend that had a field-name bug).
      // Clear it so the user is redirected to login with a clean state.
      if (!authToken.accessToken) {
        console.warn('[AuthService] Stored token has no accessToken — clearing corrupt localStorage entry');
        this.logout();
        return null;
      }

      return authToken.accessToken;
    } catch (error) {
      console.error('Error retrieving token:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Get the role claim ("role": "ADMIN" | "SUPPORT" | "USER") embedded in the JWT.
   * The role is never returned by the login response — it only exists inside the
   * token itself, so it is decoded client-side rather than stored separately.
   *
   * @returns The role string, or null if there is no valid token / no role claim
   */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = decodeJwtPayload<{ role?: string }>(token);
    return payload?.role ?? null;
  }

  /**
   * Whether the currently logged-in user has the ADMIN role
   */
  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  /**
   * Get the username of the currently logged-in user (from stored token data)
   */
  getUsername(): string | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;
      const authToken: AuthToken = JSON.parse(tokenData);
      return authToken.username ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Store authentication token in localStorage
   * Calculates expiration time and stores it alongside the token
   *
   * @param token - The AuthToken object containing token details
   */
  setToken(token: AuthToken): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));

      // Calculate and store expiration time
      const expirationTime = token.issuedAt + token.expiresIn * 1000; // Convert seconds to milliseconds
      localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationTime.toString());
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Clear the current token
   * Used primarily by the auth interceptor when 401 is received
   */
  clearToken(): void {
    this.logout();
  }

  /**
   * Check if the current token is valid (not expired)
   * Validates token existence and expiration time
   * Includes a small buffer (60 seconds) for clock skew
   *
   * @returns true if token exists and is not expired, false otherwise
   */
  isTokenValid(): boolean {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      const expirationTimeStr = localStorage.getItem(this.TOKEN_EXPIRATION_KEY);

      if (!tokenData || !expirationTimeStr) {
        return false;
      }

      const expirationTime = parseInt(expirationTimeStr, 10);
      const currentTime = Date.now();
      // No buffer: respect the exact expiration time the backend issued.
      // A 60-second buffer was causing the frontend to drop valid tokens early
      // and make un-authenticated requests that returned 401.
      return currentTime < expirationTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Check if the session has expired
   * Inverse of isTokenValid
   *
   * @returns Observable<boolean> - true if session is expired
   */
  sessionExpired(): Observable<boolean> {
    return this.isAuthenticated$.pipe(map(() => !this.isTokenValid()));
  }

  /**
   * Get remaining time until token expires in seconds
   * Useful for UI indicators or preemptive refresh logic
   *
   * @returns Number of seconds remaining, or 0 if token is expired or missing
   */
  getRemainingTime(): number {
    try {
      const expirationTimeStr = localStorage.getItem(this.TOKEN_EXPIRATION_KEY);
      if (!expirationTimeStr) {
        return 0;
      }

      const expirationTime = parseInt(expirationTimeStr, 10);
      const currentTime = Date.now();
      const remainingMs = expirationTime - currentTime;

      return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return 0;
    }
  }

  /**
   * Helper method to parse issuedAt timestamp from backend response
   * Backend may return ISO string or milliseconds timestamp
   *
   * @param issuedAt - The issuedAt value from LoginResponse
   * @returns Milliseconds since epoch
   */
  private getIssuedAtTimestamp(issuedAt: number | string): number {
    if (typeof issuedAt === 'number') {
      // If already a number, check if it's milliseconds (current time) or seconds
      // Current time in ms is typically >= 1.6 billion, in seconds >= 1.6 billion seconds
      // To differentiate: if > 1e10, likely milliseconds; if < 1e10, likely seconds
      return issuedAt > 1e10 ? issuedAt : issuedAt * 1000;
    } else if (typeof issuedAt === 'string') {
      // If ISO string, parse it
      return new Date(issuedAt).getTime();
    }
    return Date.now();
  }
}


