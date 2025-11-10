# 🍯 Miel Dating App - Complete Documentation

## Executive Overview

**Miel** (Hebrew for "honey") is a comprehensive, modern dating application built with Next.js 15, featuring intelligent matchmaking algorithms, real-time communication, premium subscriptions, AI-powered dating assistance, and ephemeral social content through stories.

### Product Vision

Miel aims to revolutionize online dating by combining sophisticated matching algorithms with an intuitive user experience. The platform goes beyond simple profile swiping by incorporating behavioral analytics, AI-powered recommendations, and real-time engagement features to help users find meaningful connections.

### Core Value Propositions

1. **Smart Matching Algorithm**: Proprietary matching system that analyzes user behavior, preferences, and interactions to suggest highly compatible matches.
2. **AI Dating Assistant**: Powered by OpenAI GPT-4, providing personalized dating advice, profile optimization tips, and conversation starters.
3. **Real-Time Communication**: Instant messaging with read receipts, typing indicators, and presence tracking via Pusher.
4. **Social Stories**: Instagram-style ephemeral content that expires after 24 hours, allowing users to share moments and engage authentically.
5. **Premium Monetization**: Stripe-powered subscription model with profile boosts, advanced analytics, and unlimited features.
6. **Multi-Modal Content**: Support for photos (Cloudinary), videos (AWS S3), and rich profile information.

---

## Business Goals

### Primary Objectives

- **User Acquisition**: Attract and onboard high-quality users seeking genuine relationships
- **Engagement**: Maintain daily active users through compelling features (stories, real-time chat, AI assistant)
- **Monetization**: Convert free users to premium subscriptions (Basic, Popular, Annual plans)
- **Retention**: Keep users engaged through smart matches and continuous platform improvements
- **Trust & Safety**: Ensure authentic profiles through OAuth verification and trust scoring

### Target Audience

- **Age Range**: 18-65+ (configurable per user preferences)
- **Geographic Focus**: Hebrew-speaking markets (Israel and diaspora)
- **Demographics**: Singles seeking relationships, dating, or companionship
- **Tech-Savvy**: Users comfortable with modern web applications and mobile-first experiences

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                          │
│  Next.js 15 App Router • React 18 • TypeScript • Tailwind CSS  │
│                     NextUI Components Library                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION LAYER                       │
│        NextAuth v5 • Google OAuth • Facebook OAuth              │
│              Credentials (Email/Password + bcrypt)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│  Server Actions • API Routes • Business Logic • Validation       │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  DATABASE   │  │  EXTERNAL    │  │   CACHE     │
│  PostgreSQL │  │  SERVICES    │  │  In-Memory  │
│  (Neon)     │  │              │  │  + Prisma   │
│  Prisma ORM │  │ • Cloudinary │  │             │
└─────────────┘  │ • AWS S3     │  └─────────────┘
                 │ • Stripe     │
                 │ • Pusher     │
                 │ • OpenAI     │
                 │ • Resend     │
                 └──────────────┘
```

### Layer Communication Flow

1. **User Interaction** → Frontend (Next.js React Components)
2. **State Management** → Zustand + React Query (client-side caching)
3. **Data Requests** → Server Actions or API Routes
4. **Authentication** → NextAuth middleware validates session
5. **Business Logic** → Server-side actions in `/app/actions`
6. **Database Operations** → Prisma ORM → PostgreSQL
7. **External Services** → Direct API calls (Stripe, OpenAI, Cloudinary, etc.)
8. **Real-Time Events** → Pusher WebSockets → Client updates

---

## Major Features Overview

### 1. **Authentication & Authorization**

- Multi-provider OAuth (Google, Facebook)
- Email/password with verification
- JWT-based sessions via NextAuth
- Role-based access (ADMIN, MEMBER)
- Trust scoring for profile authenticity

### 2. **Profile Management**

- Comprehensive user profiles (name, bio, age, location, interests)
- Photo uploads (Cloudinary) with approval system
- Video introductions (AWS S3) with pre-signed URLs
- Interest tagging (97 predefined interests across 10 categories)
- Profile completion tracking
- GPS-based location (optional)

### 3. **Smart Matching System**

- **Behavioral Analytics**: Tracks views, likes, messages, interactions
- **Compatibility Scoring**: Multi-factor algorithm considering:
  - Age compatibility (25 points)
  - Location proximity (20 points)
  - Shared interests (25 points)
  - Personality matching (15 points)
  - Behavioral patterns (15 points)
- **Match Caching**: 6-hour cache for performance
- **Personalized Match Reasons**: Dynamic, context-aware explanations

### 4. **Real-Time Messaging**

- One-on-one instant messaging
- Read receipts and typing indicators
- Message starring and archiving
- Soft delete (sender/recipient can delete independently)
- Pusher WebSocket integration
- New message notifications

### 5. **Social Stories**

- 24-hour ephemeral content
- Image upload with filters and text overlays
- Story views tracking
- Reactions (heart, fire, love eyes, eyes)
- Direct message replies
- Analytics for story creators (Premium feature)
- Free users: 1 story/day, Premium: unlimited

### 6. **AI Dating Assistant** 🤖

- GPT-4o-mini powered conversational AI
- **Capabilities**:
  - Find compatible matches
  - Generate ice breakers
  - Profile improvement suggestions
  - Progress analysis and statistics
  - Dating advice
  - Match explanation
- Rate limiting: 5 queries/day (free), 999/day (premium)
- Conversation history storage
- Usage analytics and token tracking

### 7. **Premium Subscriptions** 💎

- **Three Tiers**:
  - **Basic**: $9.99/month, 5 profile boosts
  - **Popular**: $24.99/quarter, 10 profile boosts
  - **Annual**: $79.99/year, 15 profile boosts
- Stripe integration (checkout + billing portal)
- Profile boosting (24-hour visibility boost)
- Unlimited stories
- Story analytics
- Advanced AI assistant access
- Subscription management (cancel, reactivate)

### 8. **Discovery & Filtering**

- Advanced filters (age range, gender, location, distance)
- Gender preference settings
- Age range preferences
- Location-based matching (GPS + manual city)
- Boosted profiles prioritization

### 9. **Profile Views Tracking**

- Who viewed your profile
- View timestamp tracking
- "Seen" status for views
- Bell notification for new views

### 10. **Lists & Organization**

- Members you liked
- Members who liked you
- Mutual matches
- Liked members list
- Profile favorites (starring)

---

## System Modules

### Frontend Modules

- **`/app`**: Next.js 15 App Router pages and layouts
- **`/components`**: Reusable React components (UI, business logic)
- **`/hooks`**: Custom React hooks for state and side effects
- **`/lib`**: Utility functions, configurations, API clients
- **`/types`**: TypeScript type definitions

### Backend Modules

- **`/app/actions`**: Server Actions for business logic
- **`/app/api`**: RESTful API routes for external integrations
- **`/prisma`**: Database schema, migrations, seed data

### Key Directories

```
src/
├── app/
│   ├── (auth)/              # Authentication pages (login, register)
│   ├── actions/             # Server actions (business logic)
│   ├── api/                 # API routes (webhooks, external services)
│   ├── members/             # Member browsing and profiles
│   ├── messages/            # Chat interface
│   ├── premium/             # Premium subscription management
│   ├── smart-matches/       # AI-powered match recommendations
│   └── stories/             # Social stories feature
├── components/
│   ├── ai-assistant/        # AI chat components
│   ├── interests/           # Interest selection UI
│   ├── navbar/              # Navigation components
│   ├── premium/             # Premium subscription UI
│   ├── stories/             # Story creation and viewing
│   └── video/               # Video upload and playback
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configurations
│   ├── schemas/             # Zod validation schemas
│   ├── constants/           # App constants (interests, etc.)
│   └── *.ts                 # Various utilities
└── types/                   # TypeScript definitions
```

---

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Component Library**: NextUI 2
- **State Management**: Zustand 5
- **Data Fetching**: TanStack React Query 5
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 6
- **Authentication**: NextAuth v5
- **Password Hashing**: bcryptjs

### External Services

- **Payment Processing**: Stripe
- **Image Storage**: Cloudinary
- **Video Storage**: AWS S3
- **Real-Time**: Pusher (WebSockets)
- **Email**: Resend
- **AI**: OpenAI (GPT-4o-mini)

### Development & Tooling

- **Package Manager**: npm
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Deployment**: Vercel

---

## Deployment & Infrastructure

### Production Environment

- **Hosting**: Vercel (edge network, serverless functions)
- **Database**: Neon PostgreSQL (serverless, auto-scaling)
- **CDN**: Vercel Edge Network + Cloudinary CDN
- **Domain**: miel-love.com

### Environment Configuration

- **Development**: `NODE_ENV=development`, localhost:3000
- **Production**: `NODE_ENV=production`, HTTPS enforced
- **Database Pooling**: Connection pooling via Prisma + Neon
- **Caching**: React Query client-side, Prisma result caching

### Performance Optimizations

- **Code Splitting**: Automatic via Next.js (chunk size: 20KB-250KB)
- **Image Optimization**: Next/Image with AVIF/WebP formats
- **Lazy Loading**: Components and routes
- **Server Components**: Default server-side rendering
- **Edge Runtime**: Select API routes on edge
- **Database Indexes**: Optimized queries with indexes

### Scalability Considerations

- **Horizontal Scaling**: Vercel serverless auto-scales
- **Database**: Neon supports up to 100K connections
- **Real-Time**: Pusher handles 100K+ concurrent connections
- **Caching Strategy**: 6-hour match cache, React Query stale-while-revalidate

---

## Security & Privacy

### Authentication Security

- **Password Storage**: bcrypt hashing (10 rounds)
- **Session Management**: HTTP-only cookies, secure flags
- **OAuth**: Industry-standard implementation (Google, Facebook)
- **CSRF Protection**: Built-in NextAuth CSRF tokens

### Data Protection

- **HTTPS**: Enforced in production
- **Input Validation**: Zod schemas on all inputs
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: React auto-escaping, Content Security Policy
- **Rate Limiting**: API and AI assistant rate limits

### Privacy Features

- **Email Verification**: Required before profile visibility
- **Profile Approval**: Photos require admin approval
- **Message Privacy**: Soft deletes, sender/recipient isolation
- **Location**: Optional GPS, user-controlled
- **Data Deletion**: Cascade deletes on account removal

---

## Key Metrics & Analytics

### User Engagement Metrics

- Profile views
- Likes sent/received
- Messages sent/received
- Story views and reactions
- Match success rate
- AI assistant queries

### Business Metrics

- Active users (DAU, MAU)
- Premium conversion rate
- Subscription churn rate
- Average revenue per user (ARPU)
- Profile boost usage
- Story creation rate

### Technical Metrics

- API response times
- Database query performance
- Pusher connection stability
- Cloudinary/S3 upload success rates
- OpenAI API latency
- Stripe transaction success rates

---

## Future Roadmap

### Planned Features

- Video calling integration
- Group chat functionality
- Advanced AI personality insights
- Gamification (badges, achievements)
- In-app events and meetups
- Voice messages
- Profile verification badges
- Enhanced search filters
- Mobile applications (iOS, Android)

### Technical Improvements

- GraphQL API layer
- Redis caching layer
- Background job processing (Bull/BullMQ)
- Advanced analytics dashboard
- A/B testing framework
- Internationalization (i18n)

---

## Documentation Structure

This documentation is organized into the following files:

1. **[README.md](./README.md)** (this file) - Executive overview and system introduction
2. **[architecture.md](./architecture.md)** - Detailed technical architecture and design patterns
3. **[database.md](./database.md)** - Complete database schema and relationships
4. **[features.md](./features.md)** - In-depth feature documentation
5. **[api_endpoints.md](./api_endpoints.md)** - API reference for all endpoints
6. **[components.md](./components.md)** - Frontend component documentation
7. **[business_logic.md](./business_logic.md)** - Core business rules and workflows
8. **[setup_and_env.md](./setup_and_env.md)** - Environment setup and configuration
9. **[development_guidelines.md](./development_guidelines.md)** - Coding standards and best practices

---

## Quick Start

For developers joining the project:

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/Miel-DatingApp.git
cd Miel-DatingApp

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Setup database
npx prisma generate
npx prisma migrate dev
npm run seed-neon  # Optional: seed with test data

# 5. Start development server
npm run dev
```

Visit [setup_and_env.md](./setup_and_env.md) for complete setup instructions.

---

## Support & Contributing

- **Technical Issues**: Check [development_guidelines.md](./development_guidelines.md)
- **Architecture Questions**: See [architecture.md](./architecture.md)
- **Feature Requests**: Create GitHub issues
- **Code Contributions**: Follow development guidelines

---

## License & Contact

**Miel Dating App** - Proprietary Software

For inquiries: support@miel-love.com

---

_Last Updated: November 2025_
