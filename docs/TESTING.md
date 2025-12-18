# Testing Documentation

## 🧪 Test Infrastructure - WERELDKLASSE Setup

Complete testing setup voor "Liefde Voor Iedereen" dating platform.

---

## 📊 Test Coverage Status

| Module | Tests | Coverage | Status |
|--------|-------|----------|--------|
| **api-helpers** | 21 tests | 100% | ✅ **PASSING** |
| Business Logic | 0 tests | 0% | ⏳ Pending |
| Custom Hooks | 0 tests | 0% | ⏳ Pending |
| Components | 0 tests | 0% | ⏳ Pending |

**Current Status:** 21/21 tests passing 🎉

---

## 🛠️ Tech Stack

- **Test Runner:** [Vitest](https://vitest.dev/) v4.0.15
  - ⚡ Fast (faster than Jest)
  - 🔄 Hot Module Replacement
  - ✅ Jest-compatible API
  - 📊 Built-in coverage with v8

- **React Testing:** [@testing-library/react](https://testing-library.com/) v16.3.0
  - User-centric testing
  - Best practices enforced
  - Works with React 18

- **DOM Environment:** jsdom v27.3.0
  - Browser-like environment in Node
  - Full DOM API support

- **Additional Tools:**
  - `@testing-library/jest-dom` - Custom matchers
  - `@testing-library/user-event` - User interactions
  - `@vitest/ui` - Visual test interface

---

## 📁 Project Structure

```
D:\datingsite2026\
├── tests/
│   ├── setup.ts                      # Global test configuration
│   ├── utils/
│   │   ├── test-utils.tsx            # React testing utilities
│   │   ├── mock-data.ts              # Mock data factories
│   │   └── prisma-mock.ts            # Prisma client mocks
│   ├── unit/
│   │   └── lib/
│   │       └── api-helpers.test.ts   # ✅ 21 tests passing
│   └── integration/
│       └── (future integration tests)
├── vitest.config.ts                  # Vitest configuration
└── package.json                      # Test scripts
```

---

## 🚀 Running Tests

### Development (Watch Mode)
```bash
npm test                    # Watch mode - auto-run on file change
npm run test:watch          # Explicit watch mode
npm run test:ui             # Visual UI (http://localhost:51204/__vitest__/)
```

### CI/CD (Run Once)
```bash
npm run test:run            # Run all tests once
npm run test:unit           # Run only unit tests
npm run test:integration    # Run only integration tests
npm run test:coverage       # Run with coverage report
```

### Specific Tests
```bash
npm test -- api-helpers          # Run tests matching "api-helpers"
npm test -- tests/unit/lib/      # Run tests in specific directory
```

---

## 📝 Test Configuration

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'liefde-voor-iedereen',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}', 'tests/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**Key Features:**
- ✅ jsdom environment for React components
- ✅ Global test utilities (describe, it, expect)
- ✅ Automatic mock cleanup between tests
- ✅ 70% coverage threshold
- ✅ Path alias support (@/lib/...)

---

## 🧰 Test Utilities

### 1. React Testing Utilities (`tests/utils/test-utils.tsx`)

```typescript
import { renderWithProviders } from '@/tests/utils/test-utils'

// Render with all providers (SessionProvider, etc.)
const { getByText } = renderWithProviders(<MyComponent />)

// Render with custom session
renderWithProviders(<ProfilePage />, {
  session: mockAdminSession
})

// Mock fetch responses
global.fetch = vi.fn().mockResolvedValue(
  createMockResponse({ success: true })
)
```

**Available Utilities:**
- `renderWithProviders()` - Render with SessionProvider
- `mockSession` - Default authenticated user
- `mockAdminSession` - Admin user session
- `createMockResponse()` - Create fetch response mocks
- `waitForPromises()` - Wait for async operations

### 2. Mock Data Factories (`tests/utils/mock-data.ts`)

```typescript
import { createMockUser, createMockProfile } from '@/tests/utils/mock-data'

// Create mock user
const user = createMockUser({ name: 'John Doe' })

// Create mock profile
const profile = createMockProfile({
  preferences: { minAge: 25, maxAge: 35 }
})

// Create multiple users
const users = createMockUsers(10)
```

**Available Factories:**
- `createMockUser()` - Prisma User object
- `createMockProfile()` - UserProfile type
- `createMockMatch()` - Match object
- `createMockMessage()` - Message object
- `createMockSwipe()` - Swipe object
- `createMockSubscription()` - Subscription object
- `createMockUsers(count)` - Array of users

### 3. Prisma Mocks (`tests/utils/prisma-mock.ts`)

```typescript
import { prismaMock } from '@/tests/utils/prisma-mock'

// Mock Prisma queries
prismaMock.user.findUnique.mockResolvedValue(mockUser)
prismaMock.match.findMany.mockResolvedValue([match1, match2])

// Reset all mocks
resetPrismaMocks(prismaMock)
```

---

## ✅ api-helpers Test Suite

### Coverage: 21 Tests - 100% Passing

#### Custom Error Classes (5 tests)
```typescript
✓ should create ApiError with correct properties
✓ should create ApiAuthError (401)
✓ should create ApiForbiddenError (403)
✓ should create ApiNotFoundError (404)
✓ should create ApiValidationError with field
```

#### requireAuth (3 tests)
```typescript
✓ should return user when authenticated
✓ should throw ApiAuthError when no session
✓ should throw ApiAuthError when user not found in database
```

#### requireAdmin (2 tests)
```typescript
✓ should return admin user when role is ADMIN
✓ should throw ApiForbiddenError when role is not ADMIN
```

#### requireCSRF (2 tests)
```typescript
✓ should pass when CSRF validation succeeds
✓ should throw ApiForbiddenError when CSRF validation fails
```

#### Response Helpers (5 tests)
```typescript
✓ should return success response with data
✓ should include pagination when provided
✓ should return error response with correct structure
✓ should include field when provided
✓ should return 400 validation error
```

#### handleApiError (4 tests)
```typescript
✓ should handle ApiError correctly
✓ should handle Prisma UniqueConstraintError
✓ should handle generic errors as 500
✓ should handle non-Error objects
```

---

## 📚 Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { myFunction } from '@/lib/my-module'

describe('myFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })

  it('should handle errors', () => {
    expect(() => myFunction(null)).toThrow('Error message')
  })
})
```

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { renderWithProviders, userEvent } from '@/tests/utils/test-utils'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />)
    expect(getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderWithProviders(<MyComponent />)

    await user.click(getByRole('button'))

    expect(getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### API Route Test Example

```typescript
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/my-route/route'
import { prismaMock } from '@/tests/utils/prisma-mock'
import { createMockUser } from '@/tests/utils/mock-data'

describe('GET /api/my-route', () => {
  it('should return data', async () => {
    const mockUser = createMockUser()
    prismaMock.user.findUnique.mockResolvedValue(mockUser)

    const request = new NextRequest('http://localhost/api/my-route')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

---

## 🎯 Coverage Goals

### Phase 1 (Current) - Foundation
- ✅ Test infrastructure setup
- ✅ api-helpers module (21 tests)
- ⏳ Business logic functions
- ⏳ Custom hooks

### Phase 2 - Core Features
- Authentication flows
- Swipe logic
- Match creation
- Message sending
- Profile updates

### Phase 3 - Components
- UI components
- Form components
- Layout components
- Page components

### Phase 4 - Integration
- API route integration tests
- E2E critical flows
- Performance tests

**Target:** 80% coverage across all modules

---

## 🔧 Debugging Tests

### Interactive UI
```bash
npm run test:ui
```
Opens visual interface at `http://localhost:51204/__vitest__/`

Features:
- Real-time test results
- Coverage visualization
- Interactive filtering
- Source code view

### VSCode Integration

Install extension: **Vitest** by ZixuanChen

Features:
- Inline test results
- Run/debug single tests
- Coverage gutters
- Jump to test

### Debug Mode

```typescript
// Add debugger statement
it('should debug', () => {
  debugger
  const result = myFunction()
  expect(result).toBe('expected')
})
```

Run with `--inspect`:
```bash
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

---

## 📈 Best Practices

### 1. **Test Behavior, Not Implementation**
```typescript
// ❌ Bad - tests implementation
expect(component.state.count).toBe(1)

// ✅ Good - tests behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

### 2. **Use Descriptive Test Names**
```typescript
// ❌ Bad
it('works', () => {})

// ✅ Good
it('should return 404 when user not found', () => {})
```

### 3. **Arrange-Act-Assert Pattern**
```typescript
it('should create user', async () => {
  // Arrange
  const userData = { name: 'John' }

  // Act
  const result = await createUser(userData)

  // Assert
  expect(result.name).toBe('John')
})
```

### 4. **One Assertion Per Test (When Possible)**
```typescript
// Split into multiple focused tests
it('should return success status', () => {
  expect(response.success).toBe(true)
})

it('should return user data', () => {
  expect(response.data.user).toBeDefined()
})
```

### 5. **Clean Up After Tests**
```typescript
afterEach(() => {
  vi.clearAllMocks()  // Clear mocks
  cleanup()           // Unmount React components
})
```

---

## 🚨 Common Issues

### Issue: Module not found
```
Error: Cannot find module '@/lib/api-helpers'
```
**Solution:** Check `vitest.config.ts` has correct path alias

### Issue: Timeout errors
```
Test timed out in 5000ms
```
**Solution:** Increase timeout or mock async operations
```typescript
it('should load data', async () => {
  // ...
}, { timeout: 10000 })
```

### Issue: Mock not working
```
Expected mock function to have been called
```
**Solution:** Ensure mocks are defined before imports
```typescript
vi.mock('@/lib/prisma')  // BEFORE importing module
import { myFunction } from '@/lib/my-module'
```

---

## 📖 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2025-12-12
**Status:** ✅ Phase 1 Complete - Foundation Solid
**Next:** Business logic function tests
