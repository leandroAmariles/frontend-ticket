import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Mock localStorage with actual storage implementation
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Polyfill Element.animate for jsdom (used by Angular animations / Material)
if (typeof (Element.prototype as any).animate !== 'function') {
  (Element.prototype as any).animate = function() {
    const player = {
      play: () => {},
      pause: () => {},
      finish: () => {},
      cancel: () => {},
      reverse: () => {},
      onfinish: null,
      oncancel: null,
      finished: Promise.resolve(),
    };
    return player;
  };
}

// Suppress Angular errors in test environment
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('NG0303') || args[0].includes('NG0100') || args[0].includes('NG04002'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

