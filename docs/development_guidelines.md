
# Development Guidelines

## Table of Contents

1. [Code Style & Standards](#code-style--standards)
2. [Project Structure](#project-structure)
3. [Naming Conventions](#naming-conventions)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [React Best Practices](#react-best-practices)
6. [Server Actions & API Routes](#server-actions--api-routes)
7. [Database Operations](#database-operations)
8. [Testing](#testing)
9. [Git Workflow](#git-workflow)
10. [Code Review Process](#code-review-process)
11. [Performance Guidelines](#performance-guidelines)
12. [Security Best Practices](#security-best-practices)

---

## Code Style & Standards

### EditorConfig

Create `.editorconfig` in project root:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### ESLint Configuration

The project uses Next.js default ESLint config with strict TypeScript rules:

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Run Linter**:

```bash
npm run lint           # Check for issues
npm run lint -- --fix  # Auto-fix issues
```

### Prettier (Recommended)

Install Prettier for consistent formatting:

```bash
npm install --save-dev prettier
```

`.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## Project Structure

### Directory Organization

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (grouped route)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx       # Auth layout
│   ├── actions/             # Server Actions
│   │   ├── authActions.ts
│   │   ├── likeActions.ts
│   │   └── ...
│   ├── api/                 # API Routes
│   │   ├── webhooks/
│   │   ├── ai-assistant/
│   │   └── ...
│   ├── members/             # Member pages
│   ├── messages/            # Messaging pages
│   ├── premium/             # Premium pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React Components
│   ├── ai-assistant/        # Feature-specific components
│   ├── navbar/
│   ├── premium/
│   ├── stories/
│   └── ui/                  # Shared UI components
├── hooks/                   # Custom React hooks
│   ├── useMessages.ts
│   ├── useNotifications.ts
│   └── ...
├── lib/                     # Utilities & Configurations
│   ├── prisma.ts            # Prisma client
│   ├── stripe.ts            # Stripe config
│   ├── schemas/             # Zod validation schemas
│   └── ...
└── types/                   # TypeScript type definitions
    ├── index.d.ts
    └── next-auth.d.ts
```

### File Naming Conventions

| Type               | Convention                  | Example                              |
| ------------------ | --------------------------- | ------------------------------------ |
| **Components**     | PascalCase                  | `MemberCard.tsx`, `LikeButton.tsx`   |
| **Server Actions** | camelCase                   | `likeActions.ts`, `memberActions.ts` |
| **Hooks**          | camelCase with `use` prefix | `useMessages.ts`, `useAuth.ts`       |
| **Utils**          | camelCase                   | `dateUtils.ts`, `validation.ts`      |
| **Types**          | PascalCase                  | `Member.ts`, `Message.ts`            |
| **Constants**      | UPPER_SNAKE_CASE            | `API_ROUTES.ts`, `CONFIG.ts`         |
| **API Routes**     | `route.ts`                  | `app/api/members/route.ts`           |

---

## Naming Conventions

### Variables & Functions

```typescript
// ✅ Good
const userProfile = await getMemberProfile();
function calculateMatchScore(user1: User, user2: User): number {}
const isAuthenticated = checkAuthStatus();

// ❌ Bad
const UP = await getMemberProfile(); // Too short
function calc(u1, u2) {} // Unclear
const auth_check = checkAuthStatus(); // Snake case
```

### Components

```typescript
// ✅ Good
export function MemberCard({ member }: { member: Member }) {}
export default function ProfilePage() {}

// ❌ Bad
export function member_card() {} // Snake case
export default function profile() {} // Not descriptive
```

### Boolean Variables

Always use `is`, `has`, `should`, `can` prefixes:

```typescript
// ✅ Good
const isLoading = true;
const hasPermission = checkPermission();
const shouldRender = user.isPremium;
const canEdit = isOwner(userId);

// ❌ Bad
const loading = true;
const permission = checkPermission();
```

### Constants

```typescript
// ✅ Good
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ❌ Bad
const maxFileSize = 10 * 1024 * 1024;
const pageSize = 20;
```

---

## TypeScript Guidelines

### Strict Mode

Always use TypeScript strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definitions

**Define types explicitly**:

```typescript
// ✅ Good
interface MemberCardProps {
  member: Member;
  onLike: (userId: string) => Promise<void>;
  isLiked: boolean;
}

function MemberCard({ member, onLike, isLiked }: MemberCardProps) {}

// ❌ Bad
function MemberCard({ member, onLike, isLiked }: any) {}
```

### Avoid `any`

```typescript
// ✅ Good
function processData(data: unknown): ProcessedData {
  if (isValidData(data)) {
    return transformData(data);
  }
  throw new Error("Invalid data");
}

// ❌ Bad
function processData(data: any) {}
```

### Use Type Guards

```typescript
// ✅ Good
function isMember(user: User | Member): user is Member {
  return "dateOfBirth" in user;
}

if (isMember(user)) {
  const age = calculateAge(user.dateOfBirth);
}

// ❌ Bad
const age = calculateAge((user as Member).dateOfBirth);
```

### Prisma Types

```typescript
// ✅ Good: Import from Prisma Client
import { Member, Photo, Interest } from "@prisma/client";

type MemberWithPhotos = Member & {
  photos: Photo[];
  interests: Interest[];
};

// Use Prisma's utility types
import { Prisma } from "@prisma/client";

type MemberCreateInput = Prisma.MemberCreateInput;
```

---

## React Best Practices

### Component Structure

```typescript
// ✅ Good Component Structure
"use client"; // If client component

import { useState, useEffect } from 'react';
import { Member } from '@prisma/client';
import { Button } from '@/components/ui/button';

// 1. Type definitions
interface MemberCardProps {
  member: Member;
  onLike: (userId: string) => Promise<void>;
}

// 2. Component function
export function MemberCard({ member, onLike }: MemberCardProps) {
  // 3. Hooks
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 4. Event handlers
  const handleLike = async () => {
    setIsLoading(true);
    try {
      await onLike(member.userId);
      setIsLiked(true);
    } catch (error) {
      console.error('Like failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Effects
  useEffect(() => {
    // Check initial like status
  }, [member.userId]);

  // 6. Render
  return (
    <div className="member-card">
      <h3>{member.name}</h3>
      <Button onClick={handleLike} disabled={isLoading}>
        {isLiked ? 'Liked' : 'Like'}
      </Button>
    </div>
  );
}
```

### Server vs. Client Components

**Server Components** (Default):

```typescript
// ✅ Use for: Data fetching, static content
async function MembersPage() {
  const members = await getMembers();
  return <MembersList members={members} />;
}
```

**Client Components** (`'use client'`):

```typescript
// ✅ Use for: Interactivity, hooks, browser APIs
"use client";

import { useState } from 'react';

export function LikeButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Props Destructuring

```typescript
// ✅ Good
function MemberCard({ name, age, city }: MemberCardProps) { }

// ❌ Bad
function MemberCard(props: MemberCardProps) {
  return <div>{props.name}</div>;
}
```

### Conditional Rendering

```typescript
// ✅ Good
{isLoading && <Spinner />}
{error && <ErrorMessage message={error} />}
{members.length > 0 ? (
  <MembersList members={members} />
) : (
  <EmptyState />
)}

// ❌ Bad
{isLoading ? <Spinner /> : null}
{error ? <ErrorMessage message={error} /> : <></>}
```

---

## Server Actions & API Routes

### Server Actions

**File Naming**: `*Actions.ts` (e.g., `likeActions.ts`)

**Structure**:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "./authActions";
import { revalidatePath } from "next/cache";

// ✅ Good Server Action
export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authentication
    const userId = await getAuthUserId();

    // 2. Authorization
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Input validation
    if (!targetUserId || typeof targetUserId !== "string") {
      return { success: false, error: "Invalid input" };
    }

    // 4. Business logic
    if (isLiked) {
      await prisma.like.delete({
        where: {
          sourceUserId_targetUserId: { sourceUserId: userId, targetUserId },
        },
      });
    } else {
      await prisma.like.create({
        data: { sourceUserId: userId, targetUserId },
      });
    }

    // 5. Revalidation
    revalidatePath("/members");
    revalidatePath(`/members/${targetUserId}`);

    // 6. Return
    return { success: true };
  } catch (error) {
    console.error("Toggle like error:", error);
    return { success: false, error: "Failed to update like" };
  }
}
```

### API Routes

**File Location**: `/app/api/*/route.ts`

**Structure**:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ✅ Good API Route
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract params
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");

    // 3. Fetch data
    const members = await prisma.member.findMany({
      skip: (page - 1) * 20,
      take: 20,
    });

    // 4. Return response
    return NextResponse.json({ members });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Database Operations

### Prisma Best Practices

**1. Use Transactions for Multiple Operations**:

```typescript
// ✅ Good
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { isPremium: true } }),
  prisma.transaction.create({ data: { userId: id, amount: 9.99 } }),
]);

// ❌ Bad
await prisma.user.update({ where: { id }, data: { isPremium: true } });
await prisma.transaction.create({ data: { userId: id, amount: 9.99 } });
```

**2. Select Only Needed Fields**:

```typescript
// ✅ Good
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true },
});

// ❌ Bad (fetches all fields)
const user = await prisma.user.findUnique({ where: { id } });
```

**3. Use Includes Wisely**:

```typescript
// ✅ Good
const member = await prisma.member.findUnique({
  where: { id },
  include: {
    photos: { where: { isApproved: true }, take: 5 },
    interests: { select: { name: true } },
  },
});

// ❌ Bad (fetches all relations)
const member = await prisma.member.findUnique({
  where: { id },
  include: { photos: true, interests: true, videos: true },
});
```

**4. Handle Errors Gracefully**:

```typescript
// ✅ Good
try {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return { error: "User not found" };
    }
  }
  throw error;
}
```

---

## Testing

### Unit Tests

**File Naming**: `*.test.ts` or `*.spec.ts`

**Example**:

```typescript
// memberActions.test.ts
import { getMemberByUserId } from "./memberActions";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
    },
  },
}));

describe("getMemberByUserId", () => {
  it("should return member when found", async () => {
    const mockMember = {
      id: "test-id",
      name: "Test User",
      userId: "user-123",
    };

    (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

    const result = await getMemberByUserId("user-123");

    expect(result).toEqual(mockMember);
    expect(prisma.member.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-123" },
    });
  });
});
```

### Component Tests

```typescript
// LikeButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LikeButton } from './LikeButton';

describe('LikeButton', () => {
  it('renders correctly', () => {
    render(<LikeButton userId="test-123" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onLike when clicked', async () => {
    const onLike = jest.fn();
    render(<LikeButton userId="test-123" onLike={onLike} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onLike).toHaveBeenCalledWith('test-123');
  });
});
```

---

## Git Workflow

### Branch Naming

| Type              | Pattern                | Example                          |
| ----------------- | ---------------------- | -------------------------------- |
| **Feature**       | `feature/description`  | `feature/add-video-upload`       |
| **Bug Fix**       | `fix/description`      | `fix/like-button-crash`          |
| **Hotfix**        | `hotfix/description`   | `hotfix/critical-security-issue` |
| **Refactor**      | `refactor/description` | `refactor/split-large-component` |
| **Documentation** | `docs/description`     | `docs/update-api-reference`      |

### Commit Messages

Follow **Conventional Commits**:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types**:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:

```bash
feat(auth): add Facebook OAuth login
fix(likes): prevent duplicate like creation
docs(api): update endpoint documentation
refactor(members): extract card logic into component
perf(matching): optimize smart match algorithm
```

### Pull Request Process

1. **Create Feature Branch**:

```bash
git checkout -b feature/add-video-upload
```

2. **Make Changes & Commit**:

```bash
git add .
git commit -m "feat(videos): add S3 video upload"
```

3. **Push to Remote**:

```bash
git push origin feature/add-video-upload
```

4. **Create Pull Request** on GitHub

   - Fill out PR template
   - Add descriptive title
   - Link related issues
   - Request reviewers

5. **Address Review Comments**

6. **Merge** (after approval)
   - Use "Squash and Merge" for cleaner history
   - Delete branch after merge

---

## Code Review Process

### Reviewer Checklist

- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] No `any` types without justification
- [ ] Error handling is present
- [ ] Authentication/authorization checks exist
- [ ] Database queries are optimized
- [ ] No sensitive data is logged
- [ ] Tests are included (when applicable)
- [ ] Documentation is updated
- [ ] No console.log statements (use proper logging)

### Review Comments

**Be Constructive**:

```
✅ Good: "Consider extracting this logic into a separate function for reusability."
❌ Bad: "This is wrong."
```

**Suggest Improvements**:

````
✅ Good: "Using `Promise.all()` here would improve performance:
```typescript
const [user, member] = await Promise.all([
  getUser(id),
  getMember(id)
]);
````

````

---

## Performance Guidelines

### Image Optimization

```typescript
// ✅ Good: Use Next/Image
import Image from 'next/image';

<Image
  src={member.image}
  alt={member.name}
  width={400}
  height={400}
  priority={isAboveFold}
  quality={80}
/>

// ❌ Bad: Regular img tag
<img src={member.image} alt={member.name} />
````

### Code Splitting

```typescript
// ✅ Good: Dynamic import for heavy components
import dynamic from 'next/dynamic';

const VideoPlayer = dynamic(() => import('./VideoPlayer'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### Database Query Optimization

```typescript
// ✅ Good: Fetch only what you need
const members = await prisma.member.findMany({
  select: {
    id: true,
    name: true,
    image: true,
    photos: { where: { isApproved: true }, take: 1 },
  },
  take: 20,
});

// ❌ Bad: Fetch everything
const members = await prisma.member.findMany({
  include: {
    photos: true,
    videos: true,
    interests: true,
    user: true,
  },
});
```

### React Query Caching

```typescript
// ✅ Good: Cache expensive queries
const { data: members } = useQuery({
  queryKey: ["members", filters],
  queryFn: () => getMembers(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## Security Best Practices

### 1. Input Validation

```typescript
// ✅ Good: Validate with Zod
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = schema.parse(data);
```

### 2. Authentication Checks

```typescript
// ✅ Good: Always check authentication
export async function updateProfile(data: FormData) {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Proceed with update
}
```

### 3. SQL Injection Prevention

```typescript
// ✅ Good: Use Prisma (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ❌ Bad: Raw SQL with user input
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;
```

### 4. XSS Prevention

```typescript
// ✅ Good: React auto-escapes
<div>{userInput}</div>

// ❌ Bad: dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 5. Sensitive Data

```typescript
// ✅ Good: Never log sensitive data
console.log("User logged in:", user.id);

// ❌ Bad
console.log("User credentials:", user.email, user.passwordHash);
```

---

## Additional Guidelines

### Error Handling

```typescript
// ✅ Good: Specific error messages
try {
  await updateProfile(data);
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return { error: "Email already exists" };
    }
  }
  return { error: "Failed to update profile" };
}

// ❌ Bad: Generic errors
try {
  await updateProfile(data);
} catch (error) {
  return { error: "Error" };
}
```

### Logging

```typescript
// ✅ Good: Structured logging
console.log("[Auth] User logged in:", {
  userId: user.id,
  timestamp: new Date().toISOString(),
});

// ❌ Bad: Unclear logging
console.log("User:", user);
```

---

## Onboarding Checklist

For new developers joining the project:

- [ ] Read all documentation in `/docs`
- [ ] Setup local development environment
- [ ] Run project locally successfully
- [ ] Review codebase structure
- [ ] Understand authentication flow
- [ ] Review database schema
- [ ] Make a small bug fix or improvement (starter task)
- [ ] Submit your first pull request
- [ ] Get familiar with code review process

---

_Last Updated: November 2025_
