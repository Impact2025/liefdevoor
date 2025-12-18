# Architectuur Documentatie - Liefde Voor Iedereen

## Inhoudsopgave
1. [Project Structuur](#project-structuur)
2. [Type Systeem](#type-systeem)
3. [API Patterns](#api-patterns)
4. [Custom Hooks](#custom-hooks)
5. [Component Architectuur](#component-architectuur)
6. [Best Practices](#best-practices)

---

## Project Structuur

```
datingsite2026/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   └── [feature]/         # Feature pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
│   ├── useCurrentUser.ts
│   ├── useMatches.ts
│   ├── useNotifications.ts
│   ├── useApi.ts
│   └── index.ts
├── lib/                  # Utility libraries
│   ├── types/           # TypeScript definitions
│   │   ├── api.ts
│   │   └── index.ts
│   ├── api-helpers.ts   # API helper functions
│   ├── cache.ts         # Caching utilities
│   ├── csrf.ts          # CSRF protection
│   ├── rate-limit.ts    # Rate limiting
│   ├── prisma.ts        # Prisma client
│   └── auth.ts          # NextAuth config
├── prisma/              # Database schema
└── docs/                # Documentation
```

---

## Type Systeem

### Centralized Type Definitions

Alle types zijn gedefinieerd in `lib/types/api.ts` en geëxporteerd via `lib/types/index.ts`.

**Benefits:**
- ✅ Single source of truth
- ✅ Type safety across frontend en backend
- ✅ Auto-completion in IDE
- ✅ Compile-time error catching

### Import Patterns

```typescript
// ✅ CORRECT - Import from centralized location
import { UserProfile, ApiResponse, Match } from '@/lib/types'

// ❌ WRONG - Don't import from multiple places
import { UserProfile } from '../types/user'
import { ApiResponse } from '../../lib/api'
```

### Key Type Categories

#### 1. Generic API Types
```typescript
ApiResponse<T>    // Wrapper voor alle API responses
ApiError          // Standaard error structure
Pagination        // Pagination metadata
```

#### 2. User Types
```typescript
User              // Basic user info
UserProfile       // Full profile with details
PublicUserProfile // Limited info voor privacy
DiscoverUser      // Profile in discover feed
UserPreferences   // Matching preferences
```

#### 3. Match & Message Types
```typescript
Match             // Match tussen users
Message           // Chat message
MatchUser         // User info in match
```

#### 4. Blog Types
```typescript
BlogPost          // Full blog post
BlogPostPreview   // List view
BlogCategory      // Category info
BlogComment       // Comment
```

---

## API Patterns

### Standardized API Responses

**Alle API routes** moeten de `ApiResponse<T>` structure gebruiken:

```typescript
// ✅ SUCCESS Response
{
  "success": true,
  "data": {
    "user": { ... }
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// ❌ ERROR Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "field": "email"
  }
}
```

### Using API Helpers

**lib/api-helpers.ts** provides reusable functions:

#### Authentication
```typescript
import { requireAuth, requireAdmin } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  // Require authentication
  const user = await requireAuth()  // Throws 401 if not authenticated

  // Or require admin
  const admin = await requireAdmin() // Throws 401/403 if not admin

  // ... route logic
}
```

#### Responses
```typescript
import { successResponse, errorResponse, notFoundError } from '@/lib/api-helpers'

// Success
return successResponse({ user: userData })

// With pagination
return successResponse(
  { users: userData },
  { page: 1, limit: 20, total: 100, totalPages: 5 }
)

// Errors
return errorResponse('VALIDATION_ERROR', 'Invalid email', 400)
return notFoundError('User')
```

#### Error Handling
```typescript
import { handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    // ... API logic
    const user = await requireAuth()
    const data = await someOperation()
    return successResponse(data)
  } catch (error) {
    return handleApiError(error) // Automatically formats error response
  }
}
```

#### Data Fetching Helpers
```typescript
import { getBlockedUserIds, areUsersMatched } from '@/lib/api-helpers'

const blockedIds = await getBlockedUserIds(userId)
const isMatched = await areUsersMatched(user1Id, user2Id)
```

---

## Custom Hooks

### useCurrentUser

```typescript
import { useCurrentUser } from '@/hooks'

function ProfilePage() {
  const { user, isLoading, error, refetch } = useCurrentUser()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!user) return <LoginPrompt />

  return <ProfileView user={user} onUpdate={refetch} />
}
```

### useApi

Generieke hook voor API calls:

```typescript
import { useApi } from '@/hooks'

function SwipeCard({ userId }: { userId: string }) {
  const { execute, isLoading } = useApi({
    onSuccess: (data) => {
      if (data.isMatch) {
        showMatchModal(data.match)
      }
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleLike = async () => {
    await execute('/api/swipe', {
      method: 'POST',
      body: JSON.stringify({ swipedId: userId, isLike: true })
    })
  }

  return (
    <button onClick={handleLike} disabled={isLoading}>
      {isLoading ? 'Swiping...' : 'Like'}
    </button>
  )
}
```

### usePost / usePut / useDelete

Specifieke hooks voor HTTP methods:

```typescript
import { usePost } from '@/hooks'

function ReportButton({ userId }: { userId: string }) {
  const { post, isLoading } = usePost('/api/report', {
    onSuccess: () => toast.success('User reported'),
    onError: (error) => toast.error(error.message)
  })

  const handleReport = async () => {
    await post({
      userId,
      reason: 'inappropriate_content',
      description: 'Offensive profile picture'
    })
  }

  return (
    <button onClick={handleReport} disabled={isLoading}>
      Report
    </button>
  )
}
```

### useMatches

```typescript
import { useMatches } from '@/hooks'

function MatchesPage() {
  const { matches, isLoading, error, refetch } = useMatches()

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}
```

### useNotifications

```typescript
import { useNotifications } from '@/hooks'

function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications()

  return (
    <div>
      <Badge count={unreadCount} />
      <button onClick={markAllAsRead}>Mark All Read</button>
      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onRead={() => markAsRead(notif.id)}
        />
      ))}
    </div>
  )
}
```

---

## Component Architectuur

### Component Hierarchy

```
components/
├── ui/                    # Atomic UI components
│   ├── Button.tsx        # Reusable button
│   ├── Card.tsx          # Generic card component
│   ├── Input.tsx         # Form input
│   ├── Modal.tsx         # Modal dialog
│   ├── Avatar.tsx        # User avatar
│   └── Badge.tsx         # Notification badge
├── forms/                # Form components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ProfileForm.tsx
│   └── ReportForm.tsx
├── features/             # Feature-specific
│   ├── discover/
│   │   ├── DiscoverCard.tsx
│   │   ├── FilterPanel.tsx
│   │   └── SwipeActions.tsx
│   ├── matches/
│   │   ├── MatchList.tsx
│   │   └── MatchCard.tsx
│   └── chat/
│       ├── MessageList.tsx
│       ├── MessageInput.tsx
│       └── ChatHeader.tsx
└── layout/               # Layout components
    ├── Header.tsx
    ├── Footer.tsx
    └── MobileNav.tsx
```

### Component Patterns

#### 1. UI Components (Atomic)
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  onClick
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
```

#### 2. Form Components
```typescript
// components/forms/LoginForm.tsx
import { usePost } from '@/hooks'
import { LoginFormData } from '@/lib/types'

export function LoginForm() {
  const { post, isLoading, error } = usePost<{ user: UserProfile }>(
    '/api/auth/login'
  )

  const handleSubmit = async (data: LoginFormData) => {
    const result = await post(data)
    if (result) {
      router.push('/discover')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

#### 3. Feature Components
```typescript
// components/features/discover/DiscoverCard.tsx
import { DiscoverUser } from '@/lib/types'
import { Card, Avatar, Badge } from '@/components/ui'

interface DiscoverCardProps {
  user: DiscoverUser
  onLike: () => void
  onPass: () => void
}

export function DiscoverCard({ user, onLike, onPass }: DiscoverCardProps) {
  return (
    <Card>
      <Avatar src={user.profileImage} size="lg" />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <SwipeActions onLike={onLike} onPass={onPass} />
    </Card>
  )
}
```

---

## Best Practices

### 1. Type Safety

```typescript
// ✅ CORRECT - Gebruik types overal
import { UserProfile } from '@/lib/types'

function ProfileCard({ user }: { user: UserProfile }) {
  return <div>{user.name}</div>
}

// ❌ WRONG - Avoid 'any'
function ProfileCard({ user }: { user: any }) {
  return <div>{user.name}</div>
}
```

### 2. Error Handling

```typescript
// ✅ CORRECT - Gebruik handleApiError
try {
  const data = await operation()
  return successResponse(data)
} catch (error) {
  return handleApiError(error)
}

// ❌ WRONG - Generic errors
try {
  const data = await operation()
  return { success: true, data }
} catch (error) {
  return { success: false, error: 'Something went wrong' }
}
```

### 3. Component Organization

```typescript
// ✅ CORRECT - Feature-specific components in features/
components/features/discover/DiscoverCard.tsx

// ✅ CORRECT - Reusable UI in ui/
components/ui/Button.tsx

// ❌ WRONG - Everything in one place
components/DiscoverCard.tsx
components/Button.tsx
```

### 4. Import Paths

```typescript
// ✅ CORRECT - Use path aliases
import { Button } from '@/components/ui'
import { useCurrentUser } from '@/hooks'
import { ApiResponse } from '@/lib/types'

// ❌ WRONG - Relative imports
import { Button } from '../../../components/ui/Button'
import { useCurrentUser } from '../../hooks/useCurrentUser'
```

### 5. API Consistency

```typescript
// ✅ CORRECT - Standardized response
return successResponse({ users: data }, pagination)

// ✅ CORRECT - Standardized error
return errorResponse('NOT_FOUND', 'User not found', 404)

// ❌ WRONG - Custom structure
return NextResponse.json({ data, page: 1 })
return NextResponse.json({ error: 'not found' })
```

---

## Migration Guide

### Voor bestaande code

1. **Import types:**
   ```typescript
   import { UserProfile, ApiResponse } from '@/lib/types'
   ```

2. **Use API helpers:**
   ```typescript
   import { requireAuth, successResponse } from '@/lib/api-helpers'
   ```

3. **Use custom hooks:**
   ```typescript
   import { useCurrentUser, useApi } from '@/hooks'
   ```

4. **Refactor components:**
   - Maak kleine, reusable components
   - Gebruik TypeScript interfaces
   - Extract logic naar custom hooks

---

**Laatst bijgewerkt:** 2024-12-12
**Versie:** 1.0 (Fase 3 Architecture Improvements)
