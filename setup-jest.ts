import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
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

