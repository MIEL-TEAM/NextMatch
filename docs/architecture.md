# System Architecture

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Layer Architecture](#layer-architecture)
4. [Data Flow](#data-flow)
5. [Authentication Flow](#authentication-flow)
6. [Real-Time Communication](#real-time-communication)
7. [File Storage Architecture](#file-storage-architecture)
8. [Caching Strategy](#caching-strategy)
9. [Performance Optimizations](#performance-optimizations)
10. [Security Architecture](#security-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Scalability Considerations](#scalability-considerations)

---

## Architecture Overview

Miel is built as a **modern, full-stack web application** using Next.js 15's App Router architecture. The application follows a **serverless, edge-optimized** deployment model with clear separation between client and server concerns.

### Architectural Principles

1. **Server-First**: Leverage Server Components and Server Actions for data fetching and mutations
2. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with client-side features
3. **Security by Default**: Authentication checks at every layer, input validation, secure session management
4. **Performance-Optimized**: Edge caching, code splitting, lazy loading, optimized images
5. **Scalable**: Serverless architecture that auto-scales with demand
6. **Maintainable**: Clear separation of concerns, TypeScript strict mode, consistent patterns

### High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │              React Components (Client + Server)                   │ │
│  │  • Server Components (default) • Client Components ('use client')│ │
│  │  • Zustand State Management • React Query Caching               │ │
│  └───────────────────┬──────────────────────────────────────────────┘ │
└─────────────────────┼──────────────────────────────────────────────────┘
                      │
                      │ HTTPS/WSS
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK (CDN)                          │
│  • Static Asset Caching • Image Optimization • Global Distribution     │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION SERVER                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      App Router (Pages)                           │ │
│  │  /app/(auth)/* │ /app/members/* │ /app/messages/*                │ │
│  └────────────────┬─────────────────────────────────────────────────┘ │
│                   │                                                     │
│  ┌────────────────┴─────────────────────────────────────────────────┐ │
│  │                   Middleware Layer                                 │ │
│  │  • Authentication Check • Route Protection • Logging              │ │
│  └────────────────┬─────────────────────────────────────────────────┘ │
│                   │                                                     │
│  ┌────────────────┴─────────────────┬──────────────────────────────┐ │
│  │      Server Actions               │      API Routes              │ │
│  │  /app/actions/*.ts                │  /app/api/*/route.ts        │ │
│  │  • Business Logic                 │  • Webhooks                  │ │
│  │  • Data Mutations                 │  • External Integrations    │ │
│  └────────────────┬─────────────────┴──────────────────────────────┘ │
└────────────────────┼────────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬─────────────────┬──────────────────┐
        ▼            ▼            ▼                 ▼                  ▼
  ┌─────────┐  ┌──────────┐  ┌─────────┐     ┌──────────┐     ┌──────────┐
  │   DB    │  │ Cloudinary│ │  AWS S3 │     │  Pusher  │     │  OpenAI  │
  │PostgreSQL│ │  Images  │  │  Videos │     │ Real-Time│     │    AI    │
  │  Prisma  │  └──────────┘  └─────────┘     └──────────┘     └──────────┘
  │   ORM    │  ┌──────────┐  ┌─────────┐
  └──────────┘  │  Stripe  │  │  Resend │
                │ Payments │  │  Email  │
                └──────────┘  └─────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology          | Version  | Purpose                                      |
| ------------------- | -------- | -------------------------------------------- |
| **Next.js**         | 15.1.6   | React framework with App Router              |
| **React**           | 18.2.0   | UI library for component-based architecture  |
| **TypeScript**      | 5.7.2    | Type safety and developer experience         |
| **Tailwind CSS**    | 3.4.1    | Utility-first CSS framework                  |
| **NextUI**          | 2.4.8    | Component library built on top of React Aria |
| **Zustand**         | 5.0.3    | Lightweight state management                 |
| **React Query**     | 5.76.1   | Server state management and caching          |
| **React Hook Form** | 7.53.2   | Form management with validation              |
| **Zod**             | 3.23.8   | Schema validation                            |
| **Framer Motion**   | 11.11.17 | Animation library                            |

### Backend Technologies

| Technology   | Version       | Purpose                        |
| ------------ | ------------- | ------------------------------ |
| **Node.js**  | 20+           | JavaScript runtime             |
| **Prisma**   | 6.4.0         | Database ORM and query builder |
| **NextAuth** | 5.0.0-beta.25 | Authentication solution        |
| **bcryptjs** | 2.4.3         | Password hashing               |
| **Zod**      | 3.23.8        | Runtime type validation        |

### External Services

| Service               | Purpose                           | Integration Method              |
| --------------------- | --------------------------------- | ------------------------------- |
| **PostgreSQL (Neon)** | Primary database                  | Prisma ORM via DATABASE_URL     |
| **Cloudinary**        | Image storage and transformation  | REST API + SDK                  |
| **AWS S3**            | Video file storage                | AWS SDK v3 with pre-signed URLs |
| **Stripe**            | Payment processing                | Stripe SDK + Webhooks           |
| **Pusher**            | Real-time WebSocket communication | Pusher SDK (client + server)    |
| **OpenAI**            | AI-powered features               | OpenAI SDK (GPT-4o-mini)        |
| **Resend**            | Transactional emails              | Resend SDK                      |
| **Vercel**            | Hosting and deployment            | Git-based continuous deployment |

---

## Layer Architecture

### 1. Presentation Layer (Frontend)

**Location**: `/src/app/` (pages) and `/src/components/`

**Responsibilities**:

- Render UI components
- Handle user interactions
- Manage client-side state (Zustand, React Query)
- Form validation and submission
- Real-time updates (Pusher integration)

**Key Patterns**:

- **Server Components** (default): For static content and initial data fetching
- **Client Components** (`'use client'`): For interactive features, state management
- **Layouts**: Shared layouts for consistent structure (`layout.tsx`)
- **Loading States**: Suspense boundaries with `loading.tsx`
- **Error Boundaries**: `error.tsx` for error handling

**Example Structure**:

```typescript
// Server Component (default)
async function MembersPage() {
  const members = await getMembers(); // Server-side data fetch
  return <MembersList members={members} />;
}

// Client Component
'use client';
function LikeButton({ userId }: { userId: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const handleLike = async () => {
    await toggleLikeMember(userId, isLiked);
    setIsLiked(!isLiked);
  };
  return <button onClick={handleLike}>Like</button>;
}
```

### 2. Authentication & Authorization Layer

**Location**: `/src/auth.ts`, `/src/auth.config.ts`, `/src/middleware.ts`

**Responsibilities**:

- User authentication (credentials, OAuth)
- Session management
- Route protection
- Role-based access control

**Technologies**:

- **NextAuth v5**: Session management, OAuth providers
- **Middleware**: Route protection at edge
- **JWT**: Secure token-based sessions

**Flow**:

```
User Login → NextAuth Provider → Credential/OAuth Validation
→ Create Session (JWT) → Set HTTP-Only Cookie → Redirect
```

**Middleware Protection**:

```typescript
// middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/members/:path*",
    "/messages/:path*",
    "/premium/:path*",
    // ... protected routes
  ],
};
```

### 3. Business Logic Layer (Server Actions)

**Location**: `/src/app/actions/`

**Responsibilities**:

- Core business logic
- Data validation
- Database operations (via Prisma)
- Integration with external services
- Error handling and logging

**Key Server Actions**:

- `authActions.ts`: Authentication utilities
- `likeActions.ts`: Like/unlike functionality, mutual match detection
- `messageActions.ts`: Message CRUD operations
- `memberActions.ts`: Profile management
- `premiumActions.ts`: Subscription management
- `smartMatchActions.ts`: Matching algorithm and user behavior tracking
- `storyActions.ts`: Story creation and management
- `videoActions.ts`: Video upload and processing

**Pattern**:

```typescript
"use server"; // Server Action marker

export async function toggleLikeMember(
  targetUserId: string,
  isLiked: boolean
) {
  // 1. Authentication check
  const userId = await getAuthUserId();

  // 2. Business logic
  if (isLiked) {
    await prisma.like.delete({ where: { ... } });
  } else {
    await prisma.like.create({ data: { ... } });

    // 3. Check for mutual match
    const mutualLike = await prisma.like.findUnique({ ... });
    if (mutualLike) {
      // 4. Trigger real-time event
      await pusherServer.trigger(...);
      // 5. Send emails
      await sendNewMatchEmail(...);
    }
  }

  return { success: true };
}
```

### 4. API Layer (REST Endpoints)

**Location**: `/src/app/api/`

**Responsibilities**:

- External webhook handlers (Stripe, Cloudinary)
- Integration endpoints for third-party services
- Specialized operations (Pusher auth, image signing)

**Key API Routes**:

- `POST /api/webhooks/stripe`: Stripe webhook handler
- `POST /api/cloudinary-webhook`: Cloudinary upload notifications
- `POST /api/pusher-auth`: Pusher channel authentication
- `GET /api/sign-image`: Generate signed URLs for uploads
- `POST /api/ai-assistant/chat`: AI assistant chat endpoint
- `GET /api/stories`: Fetch stories
- `POST /api/premium`: Create checkout sessions

**Pattern**:

```typescript
// /api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  // Handle event
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutComplete(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCanceled(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

### 5. Data Access Layer (Prisma ORM)

**Location**: `/prisma/schema.prisma`, `/src/lib/prisma.ts`

**Responsibilities**:

- Database schema definition
- Type-safe database queries
- Migrations management
- Connection pooling

**Prisma Client Pattern**:

```typescript
// /lib/prisma.ts - Singleton pattern
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Query Example**:

```typescript
// Fetch members with relations
const members = await prisma.member.findMany({
  where: { userId: { not: currentUserId } },
  include: {
    interests: { select: { name: true } },
    photos: { where: { isApproved: true } },
    user: { select: { isPremium: true } },
  },
  orderBy: { created: "desc" },
  take: 20,
});
```

### 6. Integration Layer (External Services)

**Responsibilities**:

- Abstract external service APIs
- Handle API credentials securely
- Implement retry logic and error handling
- Rate limiting and quotas

**Service Clients**:

```typescript
// /lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// /lib/pusher.ts
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "eu",
  useTLS: true,
});

// /lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

---

## Data Flow

### 1. Read Operations (Data Fetching)

**Server Component Pattern** (Preferred for initial loads):

```
1. User navigates to /members
2. Next.js renders MembersPage (Server Component)
3. Server Component fetches data: await getMembers()
4. getMembers() calls Server Action → Prisma → PostgreSQL
5. Data serialized and embedded in HTML
6. HTML sent to client with data already rendered
7. React hydrates on client
```

**Client Component Pattern** (For dynamic/interactive data):

```
1. User clicks "Load More" button
2. Client Component calls Server Action: await loadMoreMembers()
3. Server Action → Prisma → PostgreSQL
4. JSON response returned to client
5. React Query caches response
6. Component re-renders with new data
```

**React Query Caching**:

```typescript
// Using React Query for optimistic updates and caching
const { data: members, isLoading } = useQuery({
  queryKey: ["members", filters],
  queryFn: () => getMembers(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 2. Write Operations (Mutations)

**Optimistic Update Flow**:

```
1. User clicks "Like" button
2. Client immediately updates UI (optimistic update)
3. Client calls Server Action: await toggleLikeMember(userId)
4. Server Action validates user session
5. Server Action performs database mutation
6. Server Action checks for mutual match
7. If mutual match:
   a. Trigger Pusher event → Both users notified
   b. Send email via Resend
8. Server Action returns success/error
9. Client receives response:
   - Success: UI stays updated
   - Error: Rollback optimistic update, show error
```

**Server Action with Revalidation**:

```typescript
"use server";
export async function updateProfile(data: ProfileData) {
  const userId = await getAuthUserId();

  // Validate input
  const validated = profileSchema.parse(data);

  // Update database
  await prisma.member.update({
    where: { userId },
    data: validated,
  });

  // Revalidate cached pages
  revalidatePath(`/members/${userId}`);
  revalidatePath("/members");

  return { success: true };
}
```

### 3. Real-Time Data Flow

**Pusher WebSocket Integration**:

```
1. Client subscribes to Pusher channel: `private-${userId}`
2. Server validates subscription via /api/pusher-auth
3. Event occurs (new message, like, match):
   a. Server Action triggers Pusher event
   b. pusherServer.trigger('private-userId', 'event', data)
4. Pusher broadcasts to subscribed clients
5. Client receives event via Pusher SDK
6. Client updates UI reactively (no page refresh)
```

**Example Real-Time Message**:

```typescript
// Server-side (in messageActions.ts)
await pusherServer.trigger(`private-${recipientId}`, "message:new", {
  messageId: message.id,
  senderId: senderId,
  senderName: sender.name,
  senderImage: sender.image,
  text: message.text,
});

// Client-side (in useMessages hook)
const channel = pusherClient.subscribe(`private-${userId}`);
channel.bind("message:new", (data) => {
  setMessages((prev) => [...prev, data]);
  showNotification(data.senderName, data.text);
});
```

---

## Authentication Flow

### 1. Credentials (Email/Password) Authentication

```
┌─────────┐                                  ┌──────────┐
│ Browser │                                  │  Server  │
└────┬────┘                                  └────┬─────┘
     │                                            │
     │  1. POST /api/auth/signin                 │
     │    { email, password }                    │
     ├──────────────────────────────────────────>│
     │                                            │
     │                                       2. Validate
     │                                          credentials
     │                                          (bcrypt)
     │                                            │
     │                                       3. Check email
     │                                          verification
     │                                            │
     │                                       4. Create session
     │                                          (JWT)
     │                                            │
     │  5. Set-Cookie: session-token             │
     │     Redirect: /members                    │
     │<──────────────────────────────────────────┤
     │                                            │
     │  6. GET /members                          │
     │     Cookie: session-token                 │
     ├──────────────────────────────────────────>│
     │                                            │
     │                                       7. Middleware
     │                                          validates JWT
     │                                            │
     │  8. HTML (protected page)                 │
     │<──────────────────────────────────────────┤
     │                                            │
```

### 2. OAuth (Google/Facebook) Authentication

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Browser │     │  Server  │     │   OAuth    │     │ Database │
└────┬────┘     └────┬─────┘     │  Provider  │     └────┬─────┘
     │               │            └──────┬─────┘          │
     │  1. Click "Login with Google"    │                │
     ├──────────────>│                   │                │
     │               │                   │                │
     │  2. Redirect to Google OAuth      │                │
     │<──────────────┤                   │                │
     │               │                   │                │
     │  3. User grants permissions       │                │
     ├──────────────────────────────────>│                │
     │               │                   │                │
     │  4. Redirect with auth code       │                │
     │<──────────────────────────────────┤                │
     │               │                   │                │
     │  5. Send auth code to server      │                │
     ├──────────────>│                   │                │
     │               │                   │                │
     │               │  6. Exchange code for access token │
     │               ├──────────────────>│                │
     │               │                   │                │
     │               │  7. Access token  │                │
     │               │<──────────────────┤                │
     │               │                   │                │
     │               │  8. Get user info │                │
     │               ├──────────────────>│                │
     │               │                   │                │
     │               │  9. User profile  │                │
     │               │<──────────────────┤                │
     │               │                                    │
     │               │  10. Find or create user account  │
     │               ├───────────────────────────────────>│
     │               │                                    │
     │               │  11. User record                   │
     │               │<───────────────────────────────────┤
     │               │                                    │
     │               │  12. Create session (JWT)          │
     │               │                                    │
     │  13. Set session cookie, redirect                  │
     │<──────────────┤                                    │
     │               │                                    │
```

### 3. Session Validation (Middleware)

```typescript
// /src/middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = !!auth?.user;
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Redirect logic
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/members", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});
```

---

## Real-Time Communication

### Pusher Architecture

**Channel Types**:

1. **Private Channels**: `private-{userId}` - User-specific notifications
2. **Presence Channels**: `presence-members` - Online user tracking (future)

**Event Types**:
| Event | Channel | Purpose |
|-------|---------|---------|
| `message:new` | `private-{userId}` | New message received |
| `message:read` | `private-{userId}` | Message marked as read |
| `like:new` | `private-{userId}` | Someone liked your profile |
| `mutual-match` | `private-{userId}` | Mutual match detected |
| `story:created` | `private-{userId}` | New story posted |
| `story:viewed` | `private-{userId}` | Story viewed |

**Client-Side Integration**:

```typescript
// /hooks/useNotificationChannel.ts
import PusherClient from "pusher-js";

export function useNotificationChannel(userId: string) {
  useEffect(() => {
    const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: "eu",
    });

    const channel = pusher.subscribe(`private-${userId}`);

    channel.bind("message:new", (data) => {
      toast.success(`New message from ${data.senderName}`);
      playNotificationSound();
      queryClient.invalidateQueries(["messages"]);
    });

    channel.bind("mutual-match", (data) => {
      showCelebrationModal(data.matchedUser);
      playCelebrationSound();
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-${userId}`);
    };
  }, [userId]);
}
```

**Server-Side Trigger**:

```typescript
// In server action
import { pusherServer } from "@/lib/pusher";

await pusherServer.trigger(`private-${recipientId}`, "message:new", {
  messageId: message.id,
  senderId: senderId,
  senderName: "John Doe",
  text: "Hello!",
  timestamp: new Date().toISOString(),
});
```

---

## File Storage Architecture

### Image Storage (Cloudinary)

**Upload Flow**:

```
1. User selects image in browser
2. Frontend requests signed upload URL from /api/sign-image
3. Server generates Cloudinary signed parameters
4. Client uploads directly to Cloudinary (bypassing server)
5. Cloudinary processes image (resize, optimize, format conversion)
6. Cloudinary webhook notifies /api/cloudinary-webhook
7. Server saves image URL and publicId to database
8. Admin reviews and approves image
9. Image becomes visible on profile
```

**Configuration**:

```typescript
// Cloudinary transformations
const transformedUrl = cloudinary.url(publicId, {
  transformation: [
    { width: 800, height: 800, crop: "fill", gravity: "face" },
    { quality: "auto:good" },
    { fetch_format: "auto" }, // Serve WebP/AVIF when supported
  ],
});
```

### Video Storage (AWS S3)

**Upload Flow**:

```
1. User selects video file
2. Frontend requests pre-signed URL from /api/videos/upload-url
3. Server generates S3 pre-signed PUT URL (expires in 1 hour)
4. Client uploads directly to S3 using pre-signed URL
5. Client notifies server via /api/videos/save-url
6. Server saves video URL to database
7. Admin reviews and approves video
8. Video becomes playable on profile
```

**S3 Configuration**:

```typescript
// /lib/aws-config.ts
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Generate pre-signed upload URL
export async function getUploadUrl(key: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: "video/mp4",
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

---

## Caching Strategy

### 1. Browser Caching

- **Static Assets**: Cached indefinitely with content hashing
- **Images**: Next/Image component with automatic optimization
- **API Responses**: React Query cache (5-10 minutes stale time)

### 2. Server-Side Caching

**React Query (Client-Side)**:

```typescript
const { data } = useQuery({
  queryKey: ["members", filters],
  queryFn: () => getMembers(filters),
  staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
  cacheTime: 10 * 60 * 1000, // Cache persists for 10 minutes
  refetchOnWindowFocus: false,
});
```

**Match Cache (Database)**:

```typescript
// Smart matches cached for 6 hours
const cachedMatches = await prisma.smartMatchCache.findFirst({
  where: {
    userId,
    createdAt: { gte: sixHoursAgo },
  },
});

if (cachedMatches) {
  return JSON.parse(cachedMatches.matchData);
}

// Compute new matches and cache
const matches = await computeSmartMatches(userId);
await prisma.smartMatchCache.create({
  data: {
    userId,
    matchData: JSON.stringify(matches),
  },
});
```

### 3. CDN Caching (Vercel Edge)

- Static pages cached at edge locations
- Dynamic routes cached with `revalidate` directive
- Manual cache invalidation via `revalidatePath()`

---

## Performance Optimizations

### 1. Code Splitting

```javascript
// next.config.ts
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: "all",
    maxInitialRequests: 5,
    minSize: 20000,
    maxSize: 250000,
  };
  return config;
};
```

### 2. Image Optimization

```typescript
<Image
  src={member.image}
  alt={member.name}
  width={800}
  height={800}
  quality={80}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={member.blurHash}
/>
```

### 3. Lazy Loading

```typescript
// Dynamic component import
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  ssr: false,
  loading: () => <Skeleton height={400} />
});
```

### 4. Database Query Optimization

```prisma
// Indexed fields in schema.prisma
model ProfileView {
  @@index([viewedId])
  @@unique([viewerId, viewedId])
}

model SmartMatchCache {
  @@index([userId, createdAt])
}
```

---

## Security Architecture

### 1. Input Validation

```typescript
// Zod schema validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
});

// Server action validation
export async function register(data: FormData) {
  const validated = registerSchema.parse(Object.fromEntries(data));
  // ... proceed with validated data
}
```

### 2. Authentication & Authorization

- **Session Management**: HTTP-only, secure cookies
- **Route Protection**: Middleware checks on every request
- **API Security**: API routes validate session
- **CSRF Protection**: Built-in NextAuth CSRF tokens

### 3. Data Protection

- **Password Hashing**: bcrypt with 10 rounds
- **SQL Injection**: Prevented by Prisma parameterized queries
- **XSS**: React auto-escaping, Content Security Policy
- **HTTPS**: Enforced in production via Vercel

### 4. Rate Limiting

```typescript
// AI assistant rate limiting
const today = new Date();
today.setHours(0, 0, 0, 0);

const dailyUsage = await prisma.aIUsageLog.count({
  where: { userId, action: "chat", createdAt: { gte: today } },
});

const maxQueries = user.isPremium ? 999 : 5;
if (dailyUsage >= maxQueries) {
  throw new Error("Daily limit reached");
}
```

---

## Deployment Architecture

### Production Environment

**Hosting**: Vercel Serverless Platform

- **Edge Network**: Global CDN with 100+ edge locations
- **Serverless Functions**: Auto-scaling Node.js runtime
- **Environment**: Production, Staging, Preview branches

**Database**: Neon PostgreSQL

- **Connection Pooling**: Built-in pooling (up to 100K connections)
- **Auto-scaling**: Computes scale based on demand
- **Backups**: Automated daily backups

**Deployment Flow**:

```
1. Developer pushes to GitHub
2. Vercel detects commit
3. Vercel runs build:
   - npm install
   - npx prisma generate
   - npx prisma migrate deploy
   - next build
4. Vercel deploys to edge network
5. Deployment URL generated
6. Custom domain updated (miel-love.com)
```

### CI/CD Pipeline

```yaml
# Automated on git push
- Install dependencies
- Run TypeScript type check
- Run ESLint
- Generate Prisma Client
- Build Next.js app
- Deploy to Vercel
```

---

## Scalability Considerations

### Current Capacity

- **Users**: Supports 100K+ concurrent users
- **Database Connections**: Neon pooling handles 100K connections
- **Real-Time**: Pusher supports 100K+ concurrent WebSocket connections
- **File Storage**: Cloudinary/S3 unlimited storage
- **Serverless Functions**: Auto-scales with Vercel

### Bottlenecks & Solutions

| Bottleneck                     | Solution                                              |
| ------------------------------ | ----------------------------------------------------- |
| **Database Query Performance** | Add indexes, optimize queries, use caching            |
| **AI API Costs**               | Rate limiting, caching responses, use GPT-4o-mini     |
| **Image Processing**           | Offload to Cloudinary transformations                 |
| **Real-Time Connections**      | Pusher handles scaling, fallback to polling if needed |
| **Server Action Timeouts**     | Optimize long-running operations, use background jobs |

### Future Scalability Improvements

- **Redis Caching Layer**: For frequently accessed data
- **Background Job Queue**: For email sending, analytics, cleanup tasks
- **Read Replicas**: For database read scaling
- **GraphQL API**: For more efficient data fetching
- **Service Worker**: For offline support and PWA features

---

## Monitoring & Observability

### Logging

- **Server Actions**: Console logging for debugging
- **API Routes**: Request/response logging
- **Errors**: Centralized error logging to Vercel

### Performance Metrics

- **Vercel Analytics**: Core Web Vitals, page load times
- **Database**: Query performance via Prisma logging
- **Third-Party Services**: Stripe dashboard, Pusher metrics, OpenAI usage

### Alerts

- **Database Errors**: Monitored via Prisma
- **Payment Failures**: Stripe webhooks
- **High API Usage**: OpenAI quota monitoring
- **Deployment Failures**: Vercel notifications

---

_Last Updated: November 2025_
