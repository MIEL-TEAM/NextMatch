# 🚀 Miel Dating App - Collaborators Setup Guide

## 📋 Quick Start Checklist

### ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] VS Code (recommended)
- [ ] GitHub account with repository access

### ✅ Initial Setup

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Configure database
- [ ] Start development server

---

## 🔧 Step-by-Step Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/Miel-DatingApp.git
cd Miel-DatingApp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Setup

Create `.env.local` file in the root directory:

```env
# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="postgresql://username:password@localhost:5432/neondb"

# =============================================================================
# AUTHENTICATION
# =============================================================================
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# =============================================================================
# GOOGLE OAUTH
# =============================================================================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# =============================================================================
# GITHUB OAUTH
# =============================================================================
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# =============================================================================
# AWS S3 (for video uploads)
# =============================================================================
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="profile-videos-miel"

# =============================================================================
# CLOUDINARY (for image uploads)
# =============================================================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# =============================================================================
# PUSHER (for real-time features)
# =============================================================================
PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"

# =============================================================================
# STRIPE (for payments)
# =============================================================================
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# =============================================================================
# EMAIL (Resend)
# =============================================================================
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# =============================================================================
# OPENAI (for AI features)
# =============================================================================
OPENAI_API_KEY="your-openai-api-key"

# =============================================================================
# DEVELOPMENT
# =============================================================================
NODE_ENV="development"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed-neon
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── complete-profile/ # Profile completion
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication APIs
│   │   ├── members/       # Member APIs
│   │   ├── messages/      # Chat APIs
│   │   └── videos/        # Video upload APIs
│   ├── members/           # Member profiles & matching
│   ├── messages/          # Chat functionality
│   └── premium/           # Premium features
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── navbar/           # Navigation components
│   └── premium/          # Premium components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Authentication config
│   └── stripe.ts         # Payment config
├── types/                 # TypeScript types
└── prisma/               # Database schema & migrations
    ├── schema.prisma     # Database schema
    └── migrations/       # Migration files
```

---

## 🎯 Key Features Overview

### 🔐 Authentication

- **Google OAuth**: Social login with Google
- **GitHub OAuth**: Social login with GitHub
- **Email/Password**: Traditional authentication
- **Profile Completion**: Multi-step profile setup

### 👥 Member Management

- **Profile Creation**: Photos, bio, interests
- **Smart Matching**: AI-powered matching algorithm
- **Profile Views**: Track who viewed your profile
- **Likes & Matches**: Like and match with other users

### 💬 Real-time Chat

- **Instant Messaging**: Real-time chat with matches
- **Message Notifications**: Push notifications for new messages
- **Online Status**: See who's online
- **Message History**: Persistent chat history

### 🎥 Video Features

- **Video Uploads**: Upload profile videos
- **Video Playback**: Watch member videos
- **AWS S3 Integration**: Secure video storage

### 💎 Premium Features

- **Subscription Plans**: Monthly/yearly subscriptions
- **Profile Boosts**: Boost your profile visibility
- **Advanced Filters**: Premium filtering options
- **Stripe Integration**: Secure payment processing

### 🤖 AI Features

- **Smart Matching**: AI-powered matching algorithm
- **Profile Analysis**: AI profile insights
- **OpenAI Integration**: Advanced AI features

---

## 🛠️ Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push to remote
git push origin feature/your-feature-name

# Create PR on GitHub
```

### Commit Message Format

```bash
# Feature
git commit -m "feat: add user profile video upload"

# Bug fix
git commit -m "fix: resolve chat message display issue"

# Documentation
git commit -m "docs: update README with new features"

# Refactor
git commit -m "refactor: improve matching algorithm"
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Pre-configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

---

## 🚀 Quick Commands Reference

### Development

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Database

```bash
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open database GUI
npx prisma db push      # Push schema changes
npx prisma migrate reset # Reset database
```

### Utilities

```bash
npm run seed-neon       # Seed database with sample data
npm run push-to-neon    # Push to production database
```

### Testing

```bash
npx tsc --noEmit        # Type checking
npm run lint            # Code linting
```

---

## 🔐 Environment Variables Guide

### Required for Development

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Application URL (http://localhost:3000 for dev)

### Required for Production

- All development variables +
- `AWS_*`: S3 configuration for video uploads
- `STRIPE_*`: Payment processing configuration
- `PUSHER_*`: Real-time features configuration

### Optional

- `OPENAI_API_KEY`: AI features (if using AI)
- `RESEND_API_KEY`: Email functionality

---

## 🆘 Troubleshooting

### Common Issues

#### 1. Database Connection

```bash
# Check if database is running
npx prisma db push

# Reset database if needed
npx prisma migrate reset

# Check database status
npx prisma studio
```

#### 2. Environment Variables

```bash
# Verify .env.local exists
ls -la .env.local

# Check if variables are loaded
echo $DATABASE_URL
```

#### 3. Dependencies

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### 5. Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma cache
rm -rf node_modules/.prisma
npm install
```

---

## 📞 Support & Communication

### Team Communication

- **GitHub Issues**: Report bugs and feature requests
- **Discord/Slack**: Team communication (if available)
- **Code Reviews**: PR reviews and feedback

### Documentation

- **README.md**: Main project documentation
- **Code Comments**: Inline documentation
- **TypeScript Types**: Type definitions

### Getting Help

1. Check this guide first
2. Search existing GitHub issues
3. Ask in team chat
4. Create new GitHub issue

---

## 🎯 Best Practices

### Code Quality

- ✅ Follow TypeScript best practices
- ✅ Write meaningful commit messages
- ✅ Test your changes thoroughly
- ✅ Update documentation when needed
- ✅ Use conventional commits

### Git Workflow

- ✅ Create feature branches
- ✅ Keep commits atomic
- ✅ Write descriptive commit messages
- ✅ Test before pushing
- ✅ Create PRs for review

### Communication

- ✅ Communicate with the team
- ✅ Ask questions when stuck
- ✅ Share progress updates
- ✅ Help other team members

---

## 🚀 Happy Coding!

**Welcome to the Miel team! 🍯**

Remember:

- 🎯 Focus on user experience
- 🔒 Security first
- 🚀 Performance matters
- 📝 Document your code
- 🤝 Collaborate effectively

**Let's build something amazing together!** ✨
