# Setup and Environment Configuration

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [External Services Setup](#external-services-setup)
6. [Development Server](#development-server)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software       | Minimum Version | Purpose                      |
| -------------- | --------------- | ---------------------------- |
| **Node.js**    | 18.0.0          | JavaScript runtime           |
| **npm**        | 9.0.0           | Package manager              |
| **Git**        | 2.0.0           | Version control              |
| **PostgreSQL** | 15.0.0          | Database (local dev) or Neon |

### Recommended Tools

- **VS Code** - IDE with TypeScript and React extensions
- **Postman** - API testing
- **pgAdmin** or **TablePlus** - Database GUI
- **Git GUI** (e.g., GitKraken, GitHub Desktop)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for dependencies
- **OS**: macOS, Windows, Linux

---

## Initial Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/Miel-DatingApp.git
cd Miel-DatingApp

# Checkout the appropriate branch
git checkout develop  # Or main for production
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This installs:
# - Next.js 15
# - React 18
# - Prisma 6
# - NextAuth v5
# - All external service SDKs
```

**Expected Output**:

```
added 1234 packages in 45s
```

### 3. Environment Configuration

```bash
# Create environment file
cp .env.example .env.local

# Open in your editor
code .env.local  # Or nano, vim, etc.
```

---

## Environment Variables

### Complete `.env.local` Template

```env
# ========================================
# DATABASE
# ========================================
DATABASE_URL="postgresql://username:password@localhost:5432/miel_db"
# OR for Neon (production):
# DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# ========================================
# AUTHENTICATION
# ========================================
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ========================================
# GOOGLE OAUTH
# ========================================
GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abcdefg.apps.googleusercontent.com"  # Same as GOOGLE_CLIENT_ID (for One Tap)

# ========================================
# FACEBOOK OAUTH
# ========================================
FACEBOOK_CLIENT_ID="123456789012345"
FACEBOOK_CLIENT_SECRET="abcdef1234567890abcdef1234567890"

# ========================================
# AWS S3 (Video Storage)
# ========================================
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET_NAME="profile-videos-miel"

# ========================================
# CLOUDINARY (Image Storage)
# ========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxy"

# ========================================
# PUSHER (Real-Time)
# ========================================
PUSHER_APP_ID="123456"
NEXT_PUBLIC_PUSHER_APP_KEY="abcdef1234567890abcd"
PUSHER_SECRET="abcdef1234567890abcd"

# ========================================
# STRIPE (Payments)
# ========================================
STRIPE_SECRET_KEY="sk_test_51xxxxx..."
STRIPE_WEBHOOK_SECRET="whsec_xxxxx..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51xxxxx..."

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_BASIC_MONTHLY_PRICE_ID="price_xxxxx"
STRIPE_POPULAR_QUARTERLY_PRICE_ID="price_xxxxx"
STRIPE_ANNUAL_YEARLY_PRICE_ID="price_xxxxx"

# ========================================
# RESEND (Email)
# ========================================
RESEND_API_KEY="re_xxxxx..."

# ========================================
# OPENAI (AI Features)
# ========================================
OPENAI_API_KEY="sk-proj-xxxxx..."

# ========================================
# APPLICATION
# ========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# ========================================
# OPTIONAL (Development)
# ========================================
# Bypass Stripe in development
NEXT_PUBLIC_BYPASS_STRIPE="false"

# Run seed script
RUN_SEED="false"
```

---

### Environment Variable Details

#### DATABASE_URL

**Purpose**: PostgreSQL connection string

**Local Development**:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/miel_db"
```

**Neon (Production)**:

```env
DATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Getting Neon URL**:

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Add `?sslmode=require` to the end

---

#### NEXTAUTH_SECRET

**Purpose**: Encryption key for NextAuth JWT tokens

**Generate**:

```bash
# Option 1: Using openssl
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

**Example**:

```env
NEXTAUTH_SECRET="abcd1234efgh5678ijkl9012mnop3456"
```

⚠️ **Important**: Use different secrets for development, staging, and production!

---

#### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

**Purpose**: Google OAuth authentication

**Setup Steps**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://miel-love.com/api/auth/callback/google` (prod)
7. Copy **Client ID** and **Client Secret**

---

#### FACEBOOK_CLIENT_ID & FACEBOOK_CLIENT_SECRET

**Purpose**: Facebook OAuth authentication

**Setup Steps**:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app → **Consumer**
3. Add **Facebook Login** product
4. Settings → **Valid OAuth Redirect URIs**:
   - `http://localhost:3000/api/auth/callback/facebook` (dev)
   - `https://miel-love.com/api/auth/callback/facebook` (prod)
5. Copy **App ID** (Client ID) and **App Secret** (Client Secret)

---

#### AWS S3 Configuration

**Purpose**: Store user video uploads

**Setup Steps**:

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create S3 bucket: `profile-videos-miel`
3. Set region: `eu-north-1` (Stockholm)
4. Permissions → CORS Configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

5. Create IAM user with S3 permissions
6. Generate Access Key ID and Secret Access Key

**Required Permissions**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::profile-videos-miel/*"
    }
  ]
}
```

---

#### CLOUDINARY Configuration

**Purpose**: Store and transform user photos

**Setup Steps**:

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy:
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

**Upload Presets**:

1. Go to **Settings** → **Upload**
2. Create upload preset: `miel_photos`
3. Set folder: `members`
4. Enable: **Auto-tagging**, **Auto-moderation**

---

#### PUSHER Configuration

**Purpose**: Real-time WebSocket communication

**Setup Steps**:

1. Sign up at [pusher.com](https://pusher.com)
2. Create new app (Channels product)
3. Select cluster: **eu** (Europe)
4. Copy credentials from **App Keys** tab:
   - **app_id** → `PUSHER_APP_ID`
   - **key** → `NEXT_PUBLIC_PUSHER_APP_KEY`
   - **secret** → `PUSHER_SECRET`

**Configuration**:

- Enable client events: ✅
- Enable authorized connections: ✅

---

#### STRIPE Configuration

**Purpose**: Payment processing for premium subscriptions

**Setup Steps**:

1. Sign up at [stripe.com](https://stripe.com)
2. Get API keys from **Developers** → **API keys**:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

**Create Products & Prices**:

1. Go to **Products** → **Add product**
2. Create three products:
   - **Basic**: $9.99/month
   - **Popular**: $24.99/quarter
   - **Annual**: $79.99/year
3. Copy Price IDs to environment variables

**Webhook Setup**:

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://miel-love.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

#### RESEND Configuration

**Purpose**: Transactional email sending

**Setup Steps**:

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys**
3. Create new key with **Full Access**
4. Copy to `RESEND_API_KEY`

**Domain Setup** (Optional for production):

1. Add custom domain (e.g., `mail.miel-love.com`)
2. Add DNS records provided by Resend
3. Verify domain

---

#### OPENAI Configuration

**Purpose**: AI-powered dating assistant

**Setup Steps**:

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys**
3. Create new secret key
4. Copy to `OPENAI_API_KEY`

**Model Used**: `gpt-4o-mini` (cost-effective, fast)

**Usage Limits**:

- Free users: 5 queries/day
- Premium users: 999 queries/day

---

## Database Setup

### Option 1: Neon (Recommended for Production)

```bash
# 1. Set DATABASE_URL to Neon connection string
DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. (Optional) Seed database
npm run seed-neon
```

### Option 2: Local PostgreSQL (Development)

```bash
# 1. Install PostgreSQL
# macOS:
brew install postgresql@15
brew services start postgresql@15

# Ubuntu:
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/

# 2. Create database
psql postgres
CREATE DATABASE miel_db;
CREATE USER miel_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE miel_db TO miel_user;
\q

# 3. Update .env.local
DATABASE_URL="postgresql://miel_user:secure_password@localhost:5432/miel_db"

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev

# 6. (Optional) Seed database
npx prisma db seed
```

### Verify Database Connection

```bash
# Test connection
npx prisma db pull

# Open Prisma Studio (GUI)
npx prisma studio
# Opens at http://localhost:5555
```

---

## External Services Setup

### Summary Checklist

- [ ] **Database**: Neon or local PostgreSQL
- [ ] **Google OAuth**: Client ID & Secret
- [ ] **Facebook OAuth**: App ID & Secret
- [ ] **AWS S3**: Bucket, Access Key, Secret Key
- [ ] **Cloudinary**: Cloud Name, API Key, Secret
- [ ] **Pusher**: App ID, Key, Secret
- [ ] **Stripe**: API Keys, Products, Webhook
- [ ] **Resend**: API Key
- [ ] **OpenAI**: API Key

### Testing External Services

```bash
# Test Cloudinary
node -e "require('cloudinary').v2.uploader.upload('test.jpg', console.log)"

# Test Stripe
npx stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test Resend
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"you@example.com","subject":"Test","html":"<p>Works!</p>"}'
```

---

## Development Server

### Start Development Server

```bash
# Standard start
npm run dev

# Opens at http://localhost:3000
```

**Console Output**:

```
▲ Next.js 15.1.6
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3.2s
```

### Common Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Database commands
npx prisma generate      # Regenerate Prisma Client
npx prisma migrate dev   # Create & apply migrations
npx prisma studio        # Open database GUI
npx prisma db push       # Push schema without migration

# Test commands
npm run test             # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Development Workflow

1. **Start Server**: `npm run dev`
2. **Make Changes**: Edit files in `/src`
3. **Auto Reload**: Next.js hot reloads automatically
4. **Check Console**: Monitor for errors in terminal
5. **Test**: Open `http://localhost:3000`

### Browser DevTools

**React DevTools**:

- Install: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Inspect components, props, state

**Next.js DevTools**:

- Built into dev mode
- Shows build info, routes, cache status

---

## Production Deployment

### Vercel Deployment (Recommended)

#### Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)

#### Deployment Steps

1. **Push to GitHub**:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**:

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Configure project:
     - Framework: **Next.js**
     - Root Directory: `./`
     - Build Command: `npm run build`

3. **Add Environment Variables**:

   - Go to **Settings** → **Environment Variables**
   - Add ALL variables from `.env.local`
   - ⚠️ Use **production** values (different from dev)

4. **Configure Build Settings**:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "devCommand": "next dev",
  "installCommand": "npm install"
}
```

5. **Deploy**:

   - Click **Deploy**
   - Wait 2-3 minutes
   - Visit deployment URL: `https://your-app.vercel.app`

6. **Add Custom Domain**:
   - Go to **Settings** → **Domains**
   - Add `miel-love.com`
   - Update DNS records as shown

#### Automatic Deployments

- **Push to `main`**: Automatic production deployment
- **Push to `develop`**: Automatic preview deployment
- **Pull Requests**: Automatic preview URLs

---

### Manual Deployment (VPS/Cloud)

#### Option 1: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build & Run
docker build -t miel-app .
docker run -p 3000:3000 --env-file .env.production miel-app
```

#### Option 2: PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build application
npm run build

# Start with PM2
pm2 start npm --name "miel-app" -- start

# Save PM2 config
pm2 save

# Setup auto-start on boot
pm2 startup
```

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [
    {
      name: "miel-app",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**:

```
Error: Can't reach database server at `localhost:5432`
```

**Solutions**:

- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` format
- Check firewall allows port 5432
- For Neon: Ensure `?sslmode=require` at end of URL

---

#### 2. Prisma Client Not Generated

**Error**:

```
Error: Cannot find module '@prisma/client'
```

**Solution**:

```bash
npx prisma generate
```

---

#### 3. NextAuth Session Issues

**Error**:

```
[next-auth][error][JWT_SESSION_ERROR]
```

**Solutions**:

- Verify `NEXTAUTH_SECRET` is set (min 32 characters)
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and try again
- For OAuth: Verify redirect URIs in provider console

---

#### 4. Cloudinary Upload Fails

**Error**:

```
Invalid signature
```

**Solutions**:

- Verify `CLOUDINARY_API_SECRET` is correct
- Check upload preset exists
- Ensure folder permissions are correct

---

#### 5. Stripe Webhook Not Working

**Error**:

```
No signatures found matching the expected signature
```

**Solutions**:

- Verify `STRIPE_WEBHOOK_SECRET`
- Check webhook endpoint URL is correct
- Test locally with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

#### 6. Pusher Connection Fails

**Error**:

```
Pusher : Error : {"type":"WebSocketError","error":{"type":"PusherError"}}
```

**Solutions**:

- Verify `NEXT_PUBLIC_PUSHER_APP_KEY` is public key (not secret)
- Check cluster is correct (should be `eu`)
- Ensure `/api/pusher-auth` endpoint is accessible

---

#### 7. Module Not Found

**Error**:

```
Module not found: Can't resolve 'some-package'
```

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

---

#### 8. TypeScript Errors

**Error**:

```
Type 'X' is not assignable to type 'Y'
```

**Solutions**:

- Run `npm run lint` to see all errors
- Regenerate Prisma Client: `npx prisma generate`
- Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

---

### Environment-Specific Issues

#### Development

- **Port 3000 in use**: Kill process on port 3000

  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9

  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

#### Production

- **Build fails on Vercel**: Check build logs, ensure all env vars are set
- **Database connection timeout**: Increase connection timeout in Prisma schema
- **Out of memory**: Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`

---

### Getting Help

1. **Check Documentation**: Re-read relevant sections
2. **Search Issues**: GitHub Issues for similar problems
3. **Check Logs**:
   - Browser console
   - Terminal output
   - Vercel deployment logs
4. **Community**:
   - Next.js Discord
   - Prisma Discord
   - Stack Overflow (tag: nextjs, prisma)

---

## Additional Resources

### Official Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org/getting-started/introduction)
- [Vercel Docs](https://vercel.com/docs)

### External Services

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Pusher Docs](https://pusher.com/docs/channels)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

---

_Last Updated: November 2025_
