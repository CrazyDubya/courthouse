import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(() => {
  // Setup global test environment
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clear any mocks after each test
});

afterAll(() => {
  // Cleanup after all tests
});
