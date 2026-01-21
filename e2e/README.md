# E2E Testing with Playwright

This directory contains end-to-end tests for the Courthouse application using Playwright.

## Setup

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install chromium
```

## Running Tests

### Run all E2E tests

```bash
npx playwright test
```

### Run tests in UI mode (interactive)

```bash
npx playwright test --ui
```

### Run specific test file

```bash
npx playwright test e2e/case-management.spec.ts
```

### Run tests in headed mode (see browser)

```bash
npx playwright test --headed
```

### Debug tests

```bash
npx playwright test --debug
```

## Test Structure

### Test Files

- **case-management.spec.ts** - Tests for creating, loading, saving, and updating cases
  - Create new case
  - Load existing case
  - Save to localStorage
  - Update case details
  - Validation errors

- **trial-simulation.spec.ts** - Tests for trial simulation workflow
  - Start/stop/pause simulation
  - AI processing indicators
  - Phase progression
  - Active speaker display
  - Real-time transcript updates
  - Simulation speed adjustment

- **evidence-management.spec.ts** - Tests for evidence handling
  - Add evidence
  - Remove evidence
  - Filter by type
  - Toggle admissibility
  - File uploads

- **user-interaction.spec.ts** - Tests for user interaction and UI
  - Select user role
  - Submit user input
  - Toggle AI control
  - Update participant personality
  - Transcript management (display, export, clear, filter)
  - Sidebar controls (toggle, resize)

## Test Coverage

### Critical User Workflows

1. **Case Creation & Loading** (5 tests)
   - Creating new cases with validation
   - Loading saved cases
   - Persistence to localStorage

2. **Trial Simulation** (8 tests)
   - Starting and controlling simulations
   - Real-time updates and phase progression
   - Performance and responsiveness

3. **Evidence Management** (5 tests)
   - Adding and managing evidence
   - File uploads
   - Filtering and admissibility

4. **User Interaction** (9 tests)
   - Role selection and user input
   - Transcript management
   - UI controls and responsiveness

**Total: 27 E2E test scenarios**

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- Base URL: http://localhost:5173
- Test directory: ./e2e
- Retries: 2 in CI, 0 locally
- Screenshots: On failure
- Trace: On first retry
- Web server: Auto-starts dev server

## CI/CD Integration

Tests are configured to run in CI with:
- Single worker (sequential execution)
- 2 retries for flaky tests
- HTML reporter for results
- Automatic dev server startup

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for elements** with appropriate timeouts
3. **Clean up state** between tests with beforeEach
4. **Test user workflows** end-to-end, not implementation details
5. **Use meaningful test descriptions** that explain what's being tested
6. **Keep tests independent** - each test should work in isolation

## Troubleshooting

### Tests timing out

- Increase timeout in test: `test('name', async ({ page }) => { ... }, 30000)`
- Check if dev server is running properly
- Verify network conditions

### Elements not found

- Check if selectors match actual DOM structure
- Add explicit waits: `await page.waitForSelector(selector)`
- Use more specific selectors with data-testid

### Flaky tests

- Add proper waits instead of hardcoded timeouts
- Use `waitForLoadState` for navigation
- Check for race conditions in async operations

## Further Reading

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
