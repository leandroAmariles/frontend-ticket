import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { AuthToken, LoginResponse, LoginRequest } from '../models';

/**
 * Authentication Service
 * Manages user authentication, token storage and retrieval, and token validation
 *
 * Key responsibilities:
 * - Login: POST to /api/auth/login and store token
 * - Logout: Clear token from storage
 * - Token Management: Get/Set tokens in localStorage
 * - Token Validation: Check token expiration (3600 second default)
 * - Session Management: Calculate remaining time and check expiration
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
      .post<LoginResponse>(`${this.API_BASE_URL}${this.LOGIN_ENDPOINT}`, loginRequest)
      .pipe(
        tap((response: LoginResponse) => {
          const authToken: AuthToken = {
            accessToken: response.accessToken,
            tokenType: response.tokenType,
            expiresIn: response.expiresIn,
            username: response.username,
            issuedAt: this.getIssuedAtTimestamp(response.issuedAt),
          };
          this.setToken(authToken);
          this.isAuthenticatedSubject.next(true);
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
      return authToken.accessToken;
    } catch (error) {
      console.error('Error retrieving token:', error);
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
      const buffer = 60 * 1000; // 60 second buffer for clock skew

      return currentTime < expirationTime - buffer;
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
    return this.isAuthenticated$.pipe(map(isAuth => !isAuth && !this.isTokenValid()));
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


