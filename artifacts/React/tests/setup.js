import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Setup global test utilities
global.testUtils = {
  // Common test data
  mockProduct: {
    id: 1,
    sku: 'TEST001',
    name: 'Test Product',
    description: 'Test Description',
    category: 'electronics',
    price: 1999,
    stock: 50,
    created_at: '2025-01-01T00:00:00Z'
  },
  
  // Helper functions
  createMockProduct: (overrides = {}) => ({
    ...global.testUtils.mockProduct,
    ...overrides
  }),
  
  waitForElement: async (getByTestId, testId, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Element with testId "${testId}" not found within ${timeout}ms`));
      }, timeout);
      
      const checkForElement = () => {
        try {
          const element = getByTestId(testId);
          clearTimeout(timer);
          resolve(element);
        } catch (error) {
          setTimeout(checkForElement, 50);
        }
      };
      
      checkForElement();
    });
  }
};

// Console error suppression for test noise
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
