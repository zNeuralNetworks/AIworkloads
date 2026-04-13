import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

function createTestStorage(): Storage {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    clear: () => {
      store = {};
    },
    getItem: (key: string) => store[key] ?? null,
    key: (index: number) => Object.keys(store)[index] ?? null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
  };
}

const testStorage = createTestStorage();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: testStorage,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: testStorage,
  });
}

afterEach(() => { testStorage.clear(); });
