/**
 * Jest setup and configuration for Tickets module unit tests
 * This file initializes test environment, mocks, and global test utilities
 */

import '@testing-library/jest-dom';

// Mock localStorage and sessionStorage using defineProperty to avoid read-only assignment errors
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Some jsdom/window implementations have read-only properties; use defineProperty to mock safely
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock as any,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock as any,
  configurable: true,
  writable: true,
});

// Suppress console errors in tests (unless needed for debugging)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('NG0100')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clear mocks between tests
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  sessionStorageMock.getItem.mockClear();
});

