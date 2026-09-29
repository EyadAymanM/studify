# 07 — Testing Strategies & GitHub Actions CI/CD

Welcome to part 7 of our study series! In this guide, we break down modern **Testing Philosophy** (from Unit tests to Playwright E2E) and how to automate quality assurance using **GitHub Actions**.

---

## 1. The Modern Testing Pyramid

In software engineering, testing is structured as a pyramid:

```text
       /\
      /  \       E2E Tests (Playwright)
     /----\      - Tests real browser flows from end to end
    /      \     - Highest fidelity, slower execution
   /--------\    Integration Tests (Supertest)
  /          \   - Tests API routes + database interaction
 /------------\  Unit Tests (Vitest)
/              \ - Tests individual functions, hooks & isolated components
---------------- - Blazing fast (< 1s), thousands can run per second
```

### Why We Selected Vitest
- **ESM-First**: Works seamlessly with modern TypeScript and Vite without complex Babel/Webpack configurations.
- **Speed**: Executes tests via Vite's blazing fast module graph and worker threads.
- **Jest Compatible**: Uses standard `describe`, `it`, and `expect` APIs.

---

## 2. Browser Automation with Playwright

Playwright automates Chromium, Firefox, and WebKit browsers. Unlike older tools like Selenium, Playwright:
1. **Auto-waits**: Automatically waits for elements to be actionable, visible, and stable before clicking or typing. No more flaky `sleep(1000)` calls!
2. **Runs in Isolated Browser Contexts**: Fast test execution without shared cookies or storage leakage.
3. **Built-in Dev Web Server**: Automatically launches `pnpm dev` before running tests and tears it down afterwards.

In `studify-client/e2e/studify.spec.ts`:
```typescript
test('should capture definition with inline tags', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('smart-input-textarea').fill('Idempotence is safe to retry #api');
  await page.getByTestId('submit-note-btn').click();
  await expect(page.getByText('Idempotence is safe to retry')).toBeVisible();
});
```

---

## 3. Continuous Integration with GitHub Actions

**Continuous Integration (CI)** is the practice of automatically building and testing your application on every single commit or Pull Request before merging into `main`.

### Anatomy of Our `.github/workflows/ci.yml`:
1. **Trigger (`on`)**: Fires on `push` and `pull_request` across all branches.
2. **Matrix Jobs**:
   - `backend-checks`: Checks out code -> sets up Node.js 22 -> installs `pnpm` -> runs `pnpm test` -> runs `pnpm build`.
   - `frontend-checks`: Installs client dependencies -> executes Vitest unit tests -> runs `pnpm build`.
   - `docker-compose-validation`: Validates Docker Compose YAML structure and service definitions.
3. **Safety Guarantee**: If any test fails, broken code is caught immediately in GitHub before it can impact users or teammates.
