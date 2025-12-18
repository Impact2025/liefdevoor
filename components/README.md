# Components Directory

## Structuur

```
components/
├── ui/              # Reusable UI components (atomic)
├── forms/           # Form components
├── features/        # Feature-specific components
└── layout/          # Layout components
```

## Component Guidelines

### UI Components (`ui/`)

**Purpose:** Kleine, herbruikbare componenten zonder business logic.

**Voorbeelden:**
- Button, Input, Card, Modal
- Avatar, Badge, Spinner
- Tabs, Accordion, Tooltip

**Kenmerken:**
- ✅ Geen API calls
- ✅ Geen state management (alleen lokale UI state)
- ✅ Props-driven
- ✅ Volledig herbruikbaar

**Voorbeeld:**
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
}

export function Button({ children, variant, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}
```

### Form Components (`forms/`)

**Purpose:** Formulieren met validatie en submit logic.

**Voorbeelden:**
- LoginForm, RegisterForm
- ProfileForm, SettingsForm
- ReportForm, FeedbackForm

**Kenmerken:**
- ✅ Form state management
- ✅ Validation
- ✅ API integration (via hooks)
- ✅ Error handling

**Voorbeeld:**
```typescript
// components/forms/LoginForm.tsx
import { usePost } from '@/hooks'
import { LoginFormData } from '@/lib/types'

export function LoginForm() {
  const { post, isLoading, error } = usePost('/api/auth/login')

  const handleSubmit = async (data: LoginFormData) => {
    await post(data)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Feature Components (`features/`)

**Purpose:** Feature-specific componenten met business logic.

**Voorbeelden:**
- `features/discover/` - DiscoverCard, FilterPanel, SwipeActions
- `features/matches/` - MatchList, MatchCard
- `features/chat/` - MessageList, MessageInput, ChatHeader

**Kenmerken:**
- ✅ Feature-specific logic
- ✅ API integration
- ✅ State management
- ✅ Compose UI components

**Voorbeeld:**
```typescript
// components/features/discover/DiscoverCard.tsx
import { DiscoverUser } from '@/lib/types'
import { Card, Avatar, Button } from '@/components/ui'

interface DiscoverCardProps {
  user: DiscoverUser
  onLike: () => void
  onPass: () => void
}

export function DiscoverCard({ user, onLike, onPass }: DiscoverCardProps) {
  return (
    <Card>
      <Avatar src={user.profileImage} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <div className="actions">
        <Button variant="secondary" onClick={onPass}>Pass</Button>
        <Button variant="primary" onClick={onLike}>Like</Button>
      </div>
    </Card>
  )
}
```

### Layout Components (`layout/`)

**Purpose:** Layout structuren en navigatie.

**Voorbeelden:**
- Header, Footer, Sidebar
- MobileNav, Breadcrumbs
- PageContainer, Section

**Kenmerken:**
- ✅ Layout structuur
- ✅ Navigatie
- ✅ Responsive design
- ✅ Consistent across pages

**Voorbeeld:**
```typescript
// components/layout/Header.tsx
import { useCurrentUser } from '@/hooks'
import { Avatar } from '@/components/ui'

export function Header() {
  const { user } = useCurrentUser()

  return (
    <header>
      <Logo />
      <Nav />
      {user && <Avatar src={user.profileImage} />}
    </header>
  )
}
```

## Naming Conventions

### Files
- **PascalCase** voor component files: `Button.tsx`, `DiscoverCard.tsx`
- **camelCase** voor utility files: `utils.ts`, `helpers.ts`

### Components
- **PascalCase** voor component namen: `Button`, `DiscoverCard`
- **Descriptive** namen: `LoginForm` not `Form`, `DiscoverCard` not `Card`

### Props Interfaces
- **ComponentNameProps** pattern: `ButtonProps`, `DiscoverCardProps`

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  // ...
}
```

## Best Practices

### 1. Single Responsibility
Elk component moet één doel hebben.

```typescript
// ✅ CORRECT
<Button onClick={handleClick}>Save</Button>
<ConfirmDialog onConfirm={handleSave} />

// ❌ WRONG - Button met te veel verantwoordelijkheid
<ButtonWithConfirmation onConfirm={handleSave} />
```

### 2. Props Over Children When Possible
Gebruik props voor configuratie, children voor content.

```typescript
// ✅ CORRECT
<Card title="Profile" actions={<Button>Edit</Button>}>
  <ProfileContent />
</Card>

// ❌ WRONG
<Card>
  <CardTitle>Profile</CardTitle>
  <CardActions><Button>Edit</Button></CardActions>
  <ProfileContent />
</Card>
```

### 3. Composition Over Configuration
Compose kleine componenten in plaats van één grote.

```typescript
// ✅ CORRECT - Composable
<Card>
  <CardHeader>
    <Avatar src={user.image} />
    <h2>{user.name}</h2>
  </CardHeader>
  <CardBody>
    <p>{user.bio}</p>
  </CardBody>
</Card>

// ❌ WRONG - Monolithic
<UserCard user={user} showAvatar showBio />
```

### 4. TypeScript Everywhere
Gebruik altijd TypeScript met proper types.

```typescript
// ✅ CORRECT
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

// ❌ WRONG
function Button({ children, variant }: any) {
  // ...
}
```

### 5. Extract Complex Logic to Hooks
Houd components simpel door logic naar hooks te verplaatsen.

```typescript
// ✅ CORRECT
function DiscoverPage() {
  const { user, isLoading } = useCurrentUser()
  const { execute: swipe } = useSwipe()

  return <DiscoverCard user={user} onSwipe={swipe} />
}

// ❌ WRONG - Logic in component
function DiscoverPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(setUser)
  }, [])

  // ...
}
```

## Quick Start

### 1. Create a new UI component:
```bash
# Create file
touch components/ui/NewComponent.tsx

# Add basic structure
export interface NewComponentProps {
  // props here
}

export function NewComponent(props: NewComponentProps) {
  return <div>...</div>
}
```

### 2. Create a feature component:
```bash
# Create feature directory
mkdir -p components/features/my-feature

# Create component
touch components/features/my-feature/MyFeature.tsx
```

### 3. Use in page:
```typescript
import { NewComponent } from '@/components/ui'
import { MyFeature } from '@/components/features/my-feature'

export default function Page() {
  return (
    <div>
      <NewComponent />
      <MyFeature />
    </div>
  )
}
```

## Resources

- **Architecture Guide:** `docs/ARCHITECTURE.md`
- **Type Definitions:** `lib/types/`
- **Custom Hooks:** `hooks/`
- **API Helpers:** `lib/api-helpers.ts`

---

**Start building world-class components!** 🚀
