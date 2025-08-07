# 🍯 Miel Dating App

## 🚀 Quick Start for Collaborators

### 📋 Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Git
- VS Code (recommended)

### 🔧 Initial Setup

1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/Miel-DatingApp.git
cd Miel-DatingApp
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Setup**

```bash
# Copy environment template
cp .env.example .env.local
```

4. **Required Environment Variables** (add to `.env.local`):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/neondb"

# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AWS S3 (for video uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="profile-videos-miel"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Pusher (for real-time features)
PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"

# Stripe (for payments)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# OpenAI (for AI features)
OPENAI_API_KEY="your-openai-api-key"
```

5. **Database Setup**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed-neon
```

6. **Start Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── members/           # Member profiles & matching
│   ├── messages/          # Chat functionality
│   └── premium/           # Premium features
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & configurations
├── types/                 # TypeScript types
└── prisma/               # Database schema & migrations
```

## 🎯 Key Features

- **Authentication**: Google, GitHub, Email/Password
- **Profile Management**: Photos, bio, interests
- **Matching System**: Smart matching algorithm
- **Real-time Chat**: Pusher integration
- **Video Uploads**: AWS S3 integration
- **Premium Features**: Stripe payments
- **AI Features**: OpenAI integration

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

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Pre-configured rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🚀 Deployment

### Vercel (Production)

- Connected to GitHub repository
- Automatic deployments on `main` branch
- Environment variables configured in Vercel dashboard

### Local Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## 📊 Database

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Database Schema

- **Users**: Authentication & profiles
- **Members**: Dating profiles
- **Messages**: Chat system
- **Interests**: User interests
- **Transactions**: Payment history

## 🔐 Environment Variables

### Required for Development

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: Application URL

### Required for Production

- All development variables +
- `AWS_*`: S3 configuration
- `STRIPE_*`: Payment processing
- `PUSHER_*`: Real-time features

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**

```bash
# Check if database is running
npx prisma db push

# Reset database if needed
npx prisma migrate reset
```

2. **Environment Variables**

```bash
# Verify .env.local exists
ls -la .env.local

# Check if variables are loaded
echo $DATABASE_URL
```

3. **Dependencies**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

- **GitHub Issues**: Report bugs and feature requests
- **Discord/Slack**: Team communication
- **Documentation**: This README and code comments

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma studio       # Open database GUI
npx prisma db push      # Push schema changes

# Utilities
npm run seed-neon       # Seed database
npm run push-to-neon    # Push to production DB
```

---

## 🚀 Happy Coding!

Remember to:

- ✅ Follow TypeScript best practices
- ✅ Write meaningful commit messages
- ✅ Test your changes thoroughly
- ✅ Update documentation when needed
- ✅ Communicate with the team

**Welcome to the Miel team! 🍯**
