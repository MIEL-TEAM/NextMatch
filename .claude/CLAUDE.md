# Miel Architecture Context

Miel is a production-grade dating app.

Tech:

- Next.js 15 (App Router)
- Server-first architecture
- TypeScript strict
- Prisma + PostgreSQL
- Server Actions for business logic
- React Query client-side
- NextAuth v5
- Stripe for premium
- Pusher for real-time
- OpenAI for AI features

Core principles:

- Database is single source of truth
- No Prisma inside client components
- No include: true
- No N+1 queries
- No business logic duplication
- No silent auth or premium changes
- Avoid full table scans
- Always use select and pagination
- Follow repository/service pattern

Sensitive systems:

- SmartMatches
- OAuth profile completion
- Premium subscription logic
- AI rate limiting
