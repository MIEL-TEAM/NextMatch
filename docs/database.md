# Database Schema Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Technology](#database-technology)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Core Entities](#core-entities)
5. [Relationship Details](#relationship-details)
6. [Indexes and Performance](#indexes-and-performance)
7. [Data Integrity](#data-integrity)
8. [Migration Strategy](#migration-strategy)

---

## Overview

The Miel Dating App uses **PostgreSQL** as its primary relational database, accessed through **Prisma ORM**. The database is hosted on **Neon** (serverless PostgreSQL) for automatic scaling and connection pooling.

### Database Statistics

- **Total Tables**: 21
- **Total Enums**: 3 (Role, TokenType, StoryPrivacy, ReactionType)
- **Total Relationships**: 40+ foreign keys
- **Primary Key Strategy**: CUID (Collision-resistant Unique Identifiers)

---

## Database Technology

### PostgreSQL on Neon

- **Version**: PostgreSQL 15+
- **Hosting**: Neon Serverless PostgreSQL
- **Connection String**: Pooled connections via Prisma
- **Backup Strategy**: Automated daily backups by Neon
- **Connection Pooling**: Up to 100,000 concurrent connections

### Prisma ORM

- **Version**: 6.4.0
- **Client Generation**: Type-safe database client
- **Migration Tool**: Prisma Migrate
- **Schema Language**: Prisma Schema (DSL)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER & AUTHENTICATION                             │
└─────────────────────────────────────────────────────────────────────────────┘

                  ┌──────────────┐
                  │    Account   │ (OAuth providers)
                  │──────────────│
                  │ id           │
                  │ userId  ────────┐
                  │ provider     │  │
                  │ providerAccountId│
                  └──────────────┘  │
                                    │
                  ┌─────────────────▼──────────────┐
                  │            User                │
                  │────────────────────────────────│
                  │ id (PK)                        │
                  │ email (unique)                 │
                  │ name                           │
                  │ passwordHash                   │
                  │ role (ADMIN|MEMBER)            │
                  │ isPremium                      │
                  │ premiumUntil                   │
                  │ boostsAvailable                │
                  │ stripeCustomerId               │
                  │ stripeSubscriptionId           │
                  │ preferredGenders               │
                  │ preferredAgeMin/Max            │
                  └─────────────┬──────────────────┘
                                │
            ┌───────────────────┼───────────────────┬─────────────────┐
            │                   │                   │                 │
            ▼                   ▼                   ▼                 ▼
  ┌───────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
  │    Member     │   │Transaction   │   │ ProfileView  │   │    Story     │
  │───────────────│   │──────────────│   │──────────────│   │──────────────│
  │ id            │   │ id           │   │ id           │   │ id           │
  │ userId (FK)   │   │ userId (FK)  │   │ viewerId(FK) │   │ userId (FK)  │
  │ name          │   │ planId       │   │ viewedId(FK) │   │ imageUrl     │
  │ dateOfBirth   │   │ amount       │   │ viewedAt     │   │ expiresAt    │
  │ gender        │   │ status       │   │ seen         │   │ privacy      │
  │ city, country │   └──────────────┘   └──────────────┘   └──────────────┘
  │ latitude      │
  │ longitude     │
  │ description   │
  │ boostedUntil  │
  └───────┬───────┘
          │
    ┌─────┼─────┬──────────┬──────────┬─────────────┐
    │     │     │          │          │             │
    ▼     ▼     ▼          ▼          ▼             ▼
 ┌────┐┌────┐┌────────┐┌────────┐┌──────────┐┌──────────┐
 │Like││Photo│Interest││ Video  ││ Message  ││UserInt...│
 └────┘└────┘└────────┘└────────┘└──────────┘└──────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           AI & ANALYTICS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────┐
         │  AIConversation          │
         │──────────────────────────│
         │ id (PK)                  │
         │ userId (FK → User)       │
         │ title                    │
         │ context (JSON)           │
         │ isActive                 │
         └──────────┬───────────────┘
                    │
                    │ 1:N
                    ▼
         ┌──────────────────────────┐
         │  AIMessage               │
         │──────────────────────────│
         │ id (PK)                  │
         │ conversationId (FK)      │
         │ role (user|assistant)    │
         │ content                  │
         │ metadata (JSON)          │
         │ tokensUsed               │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  AIUsageLog              │
         │──────────────────────────│
         │ id (PK)                  │
         │ userId (FK → User)       │
         │ action                   │
         │ tokens                   │
         │ cost                     │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  SmartMatchCache         │
         │──────────────────────────│
         │ id (PK)                  │
         │ userId (FK → User)       │
         │ matchData (JSON)         │
         │ createdAt                │
         └──────────────────────────┘

         ┌──────────────────────────┐
         │  UserInteraction         │
         │──────────────────────────│
         │ id (PK)                  │
         │ userId (FK → Member)     │
         │ targetId (FK → Member)   │
         │ action                   │
         │ duration                 │
         │ weight                   │
         │ timestamp                │
         └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORIES FEATURE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────┐
         │       Story              │
         │──────────────────────────│
         │ id (PK)                  │
         │ userId (FK → User)       │
         │ imageUrl                 │
         │ publicId                 │
         │ textOverlay              │
         │ textX, textY             │
         │ filter                   │
         │ privacy                  │
         │ expiresAt (24h)          │
         │ isActive                 │
         └──────────┬───────────────┘
                    │
        ┌───────────┼────────────┬──────────┐
        │           │            │          │
        ▼           ▼            ▼          ▼
   ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │StoryView│StoryReaction│StoryReply│
   │────────│ │──────────│ │──────────│
   │storyId │ │storyId   │ │storyId   │
   │viewerId│ │userId    │ │senderId  │
   │viewedAt│ │reaction  │ │message   │
   └────────┘ └──────────┘ └──────────┘
```

---

## Core Entities

### 1. User

**Purpose**: Central authentication and account management entity

| Column                  | Type     | Constraints           | Description                                  |
| ----------------------- | -------- | --------------------- | -------------------------------------------- |
| `id`                    | String   | PRIMARY KEY, CUID     | Unique user identifier                       |
| `name`                  | String   | NULLABLE              | Display name                                 |
| `email`                 | String   | UNIQUE, NULLABLE      | Email address (required for credentials)     |
| `emailVerified`         | DateTime | NULLABLE              | Email verification timestamp                 |
| `passwordHash`          | String   | NULLABLE              | Hashed password (bcrypt, null for OAuth)     |
| `image`                 | String   | NULLABLE              | Profile picture URL                          |
| `profileComplete`       | Boolean  | DEFAULT false         | Profile completion status                    |
| `role`                  | Enum     | DEFAULT MEMBER        | ADMIN or MEMBER                              |
| `isPremium`             | Boolean  | DEFAULT false         | Premium subscription status                  |
| `premiumUntil`          | DateTime | NULLABLE              | Premium expiration date                      |
| `boostsAvailable`       | Int      | DEFAULT 0             | Number of profile boosts remaining           |
| `boostsUsed`            | Int      | DEFAULT 0             | Historical boost count                       |
| `canceledAt`            | DateTime | NULLABLE              | Subscription cancellation date               |
| `stripeCustomerId`      | String   | NULLABLE              | Stripe customer ID                           |
| `stripeSubscriptionId`  | String   | NULLABLE              | Stripe subscription ID                       |
| `provider`              | String   | NULLABLE              | OAuth provider (google/facebook/credentials) |
| `oauthVerified`         | Boolean  | DEFAULT false         | OAuth verification status                    |
| `trustScore`            | Int      | DEFAULT 0             | Authenticity score (0-100)                   |
| `lastActiveAt`          | DateTime | NULLABLE              | Last activity timestamp                      |
| `emailNotifications`    | JSON     | DEFAULT {...}         | Email notification preferences               |
| `preferredGenders`      | String   | DEFAULT "male,female" | Comma-separated gender preferences           |
| `preferredAgeMin`       | Int      | DEFAULT 18            | Minimum age preference                       |
| `preferredAgeMax`       | Int      | DEFAULT 100           | Maximum age preference                       |
| `hasSeenMembersIntro`   | Boolean  | DEFAULT false         | Onboarding flag                              |
| `hasSeenWelcomeMessage` | Boolean  | DEFAULT false         | Onboarding flag                              |

**Relationships**:

- `1:1` with Member (optional, created after profile completion)
- `1:N` with Transaction (payment history)
- `1:N` with Account (OAuth providers)
- `1:N` with ProfileView (as viewer and viewed)
- `1:N` with Story
- `1:N` with StoryView, StoryReaction, StoryReply
- `1:N` with AIConversation
- `1:N` with AIUsageLog
- `1:N` with SmartMatchCache

---

### 2. Member

**Purpose**: Dating profile information (created after profile completion)

| Column              | Type     | Constraints                | Description                    |
| ------------------- | -------- | -------------------------- | ------------------------------ |
| `id`                | String   | PRIMARY KEY, CUID          | Member identifier              |
| `userId`            | String   | UNIQUE, FOREIGN KEY → User | One-to-one with User           |
| `name`              | String   | REQUIRED                   | Full name                      |
| `dateOfBirth`       | DateTime | REQUIRED                   | Birth date for age calculation |
| `gender`            | String   | REQUIRED                   | Gender (male/female/other)     |
| `created`           | DateTime | DEFAULT now()              | Profile creation date          |
| `updated`           | DateTime | DEFAULT now()              | Last profile update            |
| `description`       | String   | REQUIRED                   | Bio/about me text              |
| `city`              | String   | REQUIRED                   | City name                      |
| `country`           | String   | REQUIRED                   | Country name                   |
| `image`             | String   | NULLABLE                   | Main profile image URL         |
| `latitude`          | Float    | NULLABLE                   | GPS latitude                   |
| `longitude`         | Float    | NULLABLE                   | GPS longitude                  |
| `locationUpdatedAt` | DateTime | NULLABLE                   | Last location update           |
| `locationEnabled`   | Boolean  | DEFAULT false              | GPS tracking enabled           |
| `maxDistance`       | Int      | DEFAULT 50                 | Max search distance (KM)       |
| `boostedUntil`      | DateTime | NULLABLE                   | Profile boost expiration       |
| `videoUrl`          | String   | NULLABLE                   | Video introduction URL         |
| `videoUploadedAt`   | DateTime | NULLABLE                   | Video upload timestamp         |

**Relationships**:

- `1:1` with User
- `1:N` with Photo (profile photos)
- `1:N` with Video
- `1:N` with Interest (tagged interests)
- `1:N` with Like (as source and target)
- `1:N` with Message (as sender and recipient)
- `1:N` with UserInteraction (as user and target)
- `1:1` with UserPreference (optional)

---

### 3. Photo

**Purpose**: User profile photos with moderation

| Column       | Type     | Constraints          | Description           |
| ------------ | -------- | -------------------- | --------------------- |
| `id`         | String   | PRIMARY KEY, CUID    | Photo identifier      |
| `url`        | String   | REQUIRED             | Cloudinary URL        |
| `publicId`   | String   | UNIQUE, NULLABLE     | Cloudinary public ID  |
| `isApproved` | Boolean  | DEFAULT false        | Admin approval status |
| `memberId`   | String   | FOREIGN KEY → Member | Owner of the photo    |
| `createdAt`  | DateTime | DEFAULT now()        | Upload timestamp      |
| `updatedAt`  | DateTime | AUTO                 | Last update timestamp |

**Business Rules**:

- Photos require admin approval before visibility
- Public ID used for Cloudinary deletions
- Multiple photos per member allowed

---

### 4. Video

**Purpose**: Video introduction stored on AWS S3

| Column       | Type     | Constraints          | Description              |
| ------------ | -------- | -------------------- | ------------------------ |
| `id`         | String   | PRIMARY KEY, CUID    | Video identifier         |
| `url`        | String   | REQUIRED             | S3 URL                   |
| `memberId`   | String   | FOREIGN KEY → Member | Owner of the video       |
| `isApproved` | Boolean  | DEFAULT false        | Admin approval status    |
| `duration`   | Int      | NULLABLE             | Video duration (seconds) |
| `createdAt`  | DateTime | DEFAULT now()        | Upload timestamp         |
| `updatedAt`  | DateTime | AUTO                 | Last update timestamp    |

---

### 5. Interest

**Purpose**: User interests/hobbies for matching

| Column     | Type   | Constraints          | Description                             |
| ---------- | ------ | -------------------- | --------------------------------------- |
| `id`       | String | PRIMARY KEY, CUID    | Interest identifier                     |
| `memberId` | String | FOREIGN KEY → Member | Member owning this interest             |
| `name`     | String | REQUIRED             | Interest name (from predefined list)    |
| `icon`     | String | REQUIRED             | Emoji icon                              |
| `category` | String | NULLABLE             | Category (entertainment, outdoor, etc.) |

**Predefined Categories**:

- Entertainment (music, movies, art, theater, dance)
- Outdoor (travel, sports, hiking, camping, beach)
- Hobbies (cooking, photography, gaming, crafts)
- Tech (technology, programming, AI, science)
- Wellness (yoga, meditation, fitness, nutrition)
- Food & Drink (wine, coffee, restaurants, baking)
- Social (volunteering, politics, clubbing, activism)
- Spiritual (religion, astrology, tarot)
- Pets (dogs, cats, birds)
- Education (languages, history, philosophy, astronomy)

---

### 6. Like

**Purpose**: User likes and mutual match detection

| Column         | Type   | Constraints          | Description        |
| -------------- | ------ | -------------------- | ------------------ |
| `sourceUserId` | String | FOREIGN KEY → Member | User who liked     |
| `targetUserId` | String | FOREIGN KEY → Member | User who was liked |

**Composite Primary Key**: `(sourceUserId, targetUserId)`

**Business Logic**:

- When creating a like, check if reverse like exists (mutual match)
- Mutual matches trigger:
  - Pusher real-time event to both users
  - Email notifications to both users
  - Celebration modal on frontend

---

### 7. Message

**Purpose**: One-on-one private messaging

| Column             | Type     | Constraints           | Description              |
| ------------------ | -------- | --------------------- | ------------------------ |
| `id`               | String   | PRIMARY KEY, CUID     | Message identifier       |
| `text`             | String   | REQUIRED              | Message content          |
| `senderId`         | String   | FOREIGN KEY → Member  | Message sender           |
| `recipientId`      | String   | FOREIGN KEY → Member  | Message recipient        |
| `memberId`         | String   | NULLABLE, FOREIGN KEY | Legacy field             |
| `created`          | DateTime | DEFAULT now()         | Sent timestamp           |
| `dateRead`         | DateTime | NULLABLE              | Read receipt timestamp   |
| `senderDeleted`    | Boolean  | DEFAULT false         | Soft delete by sender    |
| `recipientDeleted` | Boolean  | DEFAULT false         | Soft delete by recipient |
| `isStarred`        | Boolean  | DEFAULT false         | Starred/favorited        |
| `isArchived`       | Boolean  | DEFAULT false         | Archived conversation    |

**Business Rules**:

- Soft deletes allow independent deletion by sender/recipient
- Read receipts only after recipientDeleted = false
- Real-time delivery via Pusher

---

### 8. ProfileView

**Purpose**: Track who viewed whose profile

| Column     | Type     | Constraints        | Description                   |
| ---------- | -------- | ------------------ | ----------------------------- |
| `id`       | String   | PRIMARY KEY, CUID  | View identifier               |
| `viewerId` | String   | FOREIGN KEY → User | User who viewed               |
| `viewedId` | String   | FOREIGN KEY → User | User whose profile was viewed |
| `viewedAt` | DateTime | DEFAULT now()      | View timestamp                |
| `seen`     | Boolean  | DEFAULT false      | User acknowledged the view    |

**Unique Constraint**: `(viewerId, viewedId)` - One view record per pair
**Index**: `viewedId` for efficient "who viewed me" queries

---

### 9. Transaction

**Purpose**: Payment and subscription history

| Column    | Type     | Constraints        | Description                               |
| --------- | -------- | ------------------ | ----------------------------------------- |
| `id`      | String   | PRIMARY KEY        | Stripe payment intent ID                  |
| `userId`  | String   | FOREIGN KEY → User | User who paid                             |
| `amount`  | Float    | REQUIRED           | Payment amount                            |
| `planId`  | String   | REQUIRED           | Plan identifier (basic/popular/annual)    |
| `status`  | String   | REQUIRED           | Payment status (succeeded/failed/pending) |
| `months`  | Int      | DEFAULT 1          | Subscription duration                     |
| `boosts`  | Int      | DEFAULT 0          | Profile boosts included                   |
| `created` | DateTime | DEFAULT now()      | Transaction creation                      |
| `updated` | DateTime | REQUIRED           | Last update timestamp                     |

---

### 10. Token

**Purpose**: Email verification and password reset tokens

| Column    | Type     | Constraints       | Description                    |
| --------- | -------- | ----------------- | ------------------------------ |
| `id`      | String   | PRIMARY KEY, CUID | Token identifier               |
| `email`   | String   | REQUIRED          | Associated email               |
| `token`   | String   | REQUIRED          | Random token string            |
| `expires` | DateTime | REQUIRED          | Expiration timestamp           |
| `type`    | Enum     | REQUIRED          | VERIFICATION or PASSWORD_RESET |

**Unique Constraint**: `(email, token)`

**Token Types**:

```prisma
enum TokenType {
  VERIFICATION
  PASSWORD_RESET
}
```

---

### 11. UserInteraction

**Purpose**: Behavioral analytics for smart matching

| Column      | Type     | Constraints          | Description                                   |
| ----------- | -------- | -------------------- | --------------------------------------------- |
| `id`        | String   | PRIMARY KEY, CUID    | Interaction identifier                        |
| `userId`    | String   | FOREIGN KEY → Member | User performing action                        |
| `targetId`  | String   | FOREIGN KEY → Member | Target user                                   |
| `action`    | String   | REQUIRED             | Action type (view/like/message/profile_click) |
| `duration`  | Int      | NULLABLE             | Duration in seconds (for views)               |
| `weight`    | Float    | DEFAULT 1.0          | Weighted importance for algorithm             |
| `timestamp` | DateTime | DEFAULT now()        | Interaction time                              |

**Action Weights** (used in matching algorithm):

- `view`: 0.5 + (duration/60 \* 0.1) up to 1.0
- `like`: 2.0
- `message`: 3.0
- `profile_click`: 1.5

---

### 12. UserPreference

**Purpose**: Store user-specific matching preferences

| Column           | Type     | Constraints                  | Description                 |
| ---------------- | -------- | ---------------------------- | --------------------------- |
| `id`             | String   | PRIMARY KEY, CUID            | Preference identifier       |
| `userId`         | String   | UNIQUE, FOREIGN KEY → Member | User                        |
| `preferenceData` | JSON     | REQUIRED                     | Flexible preference storage |
| `lastUpdated`    | DateTime | DEFAULT now()                | Last update timestamp       |

**Example preferenceData JSON**:

```json
{
  "filters": {
    "ageRange": [25, 35],
    "maxDistance": 50,
    "genders": ["female"]
  },
  "dealBreakers": ["smoking"],
  "mustHaves": ["wants_kids"]
}
```

---

### 13. SmartMatchCache

**Purpose**: Cache computed smart matches for performance

| Column      | Type          | Constraints        | Description                   |
| ----------- | ------------- | ------------------ | ----------------------------- |
| `id`        | String        | PRIMARY KEY, CUID  | Cache identifier              |
| `userId`    | String        | FOREIGN KEY → User | User whose matches are cached |
| `matchData` | String (TEXT) | REQUIRED           | JSON string of match results  |
| `createdAt` | DateTime      | DEFAULT now()      | Cache creation time           |
| `updatedAt` | DateTime      | AUTO               | Last update time              |

**Index**: `(userId, createdAt)` for efficient cache lookups

**Cache Strategy**:

- Matches cached for 6 hours
- Invalidated on user profile changes
- Stores match scores and reasons as JSON

**Example matchData**:

```json
[
  {
    "userId": "clx123",
    "matchScore": 87,
    "matchReason": "בן 28 - בדיוק בטווח שחיפשת! 🎯"
  }
]
```

---

### 14-17. Story Feature

#### 14. Story

**Purpose**: 24-hour ephemeral content (like Instagram Stories)

| Column        | Type     | Constraints        | Description                  |
| ------------- | -------- | ------------------ | ---------------------------- |
| `id`          | String   | PRIMARY KEY, CUID  | Story identifier             |
| `userId`      | String   | FOREIGN KEY → User | Story creator                |
| `imageUrl`    | String   | REQUIRED           | Cloudinary image URL         |
| `publicId`    | String   | NULLABLE           | Cloudinary public ID         |
| `textOverlay` | String   | NULLABLE           | Text on story                |
| `textX`       | Float    | NULLABLE           | Text X position (0-1)        |
| `textY`       | Float    | NULLABLE           | Text Y position (0-1)        |
| `filter`      | String   | NULLABLE           | Applied filter name          |
| `privacy`     | Enum     | DEFAULT PUBLIC     | PUBLIC/PREMIUM/PRIVATE       |
| `createdAt`   | DateTime | DEFAULT now()      | Creation timestamp           |
| `expiresAt`   | DateTime | REQUIRED           | Expiration (createdAt + 24h) |
| `isActive`    | Boolean  | DEFAULT true       | Active status                |

**Indexes**:

- `(userId, isActive, expiresAt)`
- `(expiresAt)` for cleanup jobs

**Privacy Types**:

```prisma
enum StoryPrivacy {
  PUBLIC    // Everyone can see
  PREMIUM   // Only premium users
  PRIVATE   // Specific users (future)
}
```

#### 15. StoryView

**Purpose**: Track story views

| Column     | Type     | Constraints         | Description        |
| ---------- | -------- | ------------------- | ------------------ |
| `id`       | String   | PRIMARY KEY, CUID   | View identifier    |
| `storyId`  | String   | FOREIGN KEY → Story | Story being viewed |
| `viewerId` | String   | FOREIGN KEY → User  | User who viewed    |
| `viewedAt` | DateTime | DEFAULT now()       | View timestamp     |

**Unique Constraint**: `(storyId, viewerId)` - One view per user per story
**Index**: `viewerId`

#### 16. StoryReaction

**Purpose**: React to stories with emojis

| Column         | Type     | Constraints         | Description            |
| -------------- | -------- | ------------------- | ---------------------- |
| `id`           | String   | PRIMARY KEY, CUID   | Reaction identifier    |
| `storyId`      | String   | FOREIGN KEY → Story | Story being reacted to |
| `userId`       | String   | FOREIGN KEY → User  | User reacting          |
| `reactionType` | Enum     | DEFAULT HEART       | Reaction emoji         |
| `createdAt`    | DateTime | DEFAULT now()       | Reaction timestamp     |

**Unique Constraint**: `(storyId, userId)` - One reaction per user per story

**Reaction Types**:

```prisma
enum ReactionType {
  HEART      // ❤️
  FIRE       // 🔥
  LOVE_EYES  // 😍
  EYES       // 👀
}
```

#### 17. StoryReply

**Purpose**: Send direct messages in response to stories

| Column        | Type     | Constraints         | Description            |
| ------------- | -------- | ------------------- | ---------------------- |
| `id`          | String   | PRIMARY KEY, CUID   | Reply identifier       |
| `storyId`     | String   | FOREIGN KEY → Story | Story being replied to |
| `senderId`    | String   | FOREIGN KEY → User  | User sending reply     |
| `recipientId` | String   | FOREIGN KEY → User  | Story owner            |
| `messageText` | String   | REQUIRED            | Reply message text     |
| `createdAt`   | DateTime | DEFAULT now()       | Reply timestamp        |

**Business Flow**:

1. User replies to story
2. Reply saved in StoryReply table
3. Message sent to recipient via Message table
4. Real-time notification via Pusher

---

### 18-20. AI Assistant Feature

#### 18. AIConversation

**Purpose**: Store AI chat conversation context

| Column      | Type     | Constraints        | Description                   |
| ----------- | -------- | ------------------ | ----------------------------- |
| `id`        | String   | PRIMARY KEY, CUID  | Conversation identifier       |
| `userId`    | String   | FOREIGN KEY → User | User owning conversation      |
| `title`     | String   | NULLABLE           | Conversation title            |
| `context`   | JSON     | NULLABLE           | Conversation context/metadata |
| `isActive`  | Boolean  | DEFAULT true       | Active conversation status    |
| `createdAt` | DateTime | DEFAULT now()      | Creation timestamp            |
| `updatedAt` | DateTime | AUTO               | Last update timestamp         |

**Index**: `(userId, isActive, updatedAt)`

#### 19. AIMessage

**Purpose**: Store individual AI chat messages

| Column           | Type          | Constraints                  | Description                    |
| ---------------- | ------------- | ---------------------------- | ------------------------------ |
| `id`             | String        | PRIMARY KEY, CUID            | Message identifier             |
| `conversationId` | String        | FOREIGN KEY → AIConversation | Parent conversation            |
| `role`           | String        | REQUIRED                     | "user" or "assistant"          |
| `content`        | String (TEXT) | REQUIRED                     | Message text                   |
| `metadata`       | JSON          | NULLABLE                     | Match suggestions, stats, etc. |
| `tokensUsed`     | Int           | NULLABLE                     | OpenAI tokens consumed         |
| `createdAt`      | DateTime      | DEFAULT now()                | Message timestamp              |

**Index**: `(conversationId, createdAt)`

**Example metadata**:

```json
{
  "matches": [{ "userId": "clx123", "name": "Sarah", "matchScore": 87 }],
  "intent": "find_matches"
}
```

#### 20. AIUsageLog

**Purpose**: Track AI usage for analytics and rate limiting

| Column      | Type     | Constraints        | Description                                    |
| ----------- | -------- | ------------------ | ---------------------------------------------- |
| `id`        | String   | PRIMARY KEY, CUID  | Log identifier                                 |
| `userId`    | String   | FOREIGN KEY → User | User making request                            |
| `action`    | String   | REQUIRED           | "chat", "match_suggestion", "profile_analysis" |
| `tokens`    | Int      | NULLABLE           | Tokens consumed                                |
| `cost`      | Float    | NULLABLE           | Cost in credits/currency                       |
| `createdAt` | DateTime | DEFAULT now()      | Request timestamp                              |

**Index**: `(userId, createdAt)`

**Rate Limiting**:

- Free users: 5 queries/day
- Premium users: 999 queries/day

---

### 21. Account

**Purpose**: Store OAuth provider accounts

| Column              | Type   | Constraints        | Description                       |
| ------------------- | ------ | ------------------ | --------------------------------- |
| `id`                | String | PRIMARY KEY, CUID  | Account identifier                |
| `userId`            | String | FOREIGN KEY → User | Associated user                   |
| `type`              | String | REQUIRED           | Account type (oauth, email)       |
| `provider`          | String | REQUIRED           | Provider name (google, facebook)  |
| `providerAccountId` | String | REQUIRED           | Provider's user ID                |
| `refresh_token`     | String | NULLABLE           | OAuth refresh token               |
| `access_token`      | String | NULLABLE           | OAuth access token                |
| `expires_at`        | Int    | NULLABLE           | Token expiration (Unix timestamp) |
| `token_type`        | String | NULLABLE           | Token type (Bearer)               |
| `scope`             | String | NULLABLE           | OAuth scopes                      |
| `id_token`          | String | NULLABLE           | OpenID Connect ID token           |
| `session_state`     | String | NULLABLE           | Session state                     |

**Unique Constraint**: `(provider, providerAccountId)`

---

### 22. UserProfileAnalysis

**Purpose**: Store AI-generated profile insights

| Column      | Type          | Constraints | Description              |
| ----------- | ------------- | ----------- | ------------------------ |
| `userId`    | String        | PRIMARY KEY | User identifier          |
| `content`   | String        | REQUIRED    | Profile analysis content |
| `insights`  | String (TEXT) | NULLABLE    | AI-generated insights    |
| `updatedAt` | DateTime      | AUTO        | Last analysis timestamp  |

---

## Relationship Details

### User ↔ Member (1:1)

```prisma
model User {
  id     String  @id @default(cuid())
  member Member?
}

model Member {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- **Cardinality**: One user can have zero or one member profile
- **Cascade Delete**: Deleting user deletes member profile

### Member ↔ Like (N:M Self-Relation)

```prisma
model Member {
  sourceLikes Like[] @relation("source")
  targetLikes Like[] @relation("target")
}

model Like {
  sourceUserId String
  targetUserId String
  sourceMember Member @relation("source", fields: [sourceUserId], references: [userId], onDelete: Cascade)
  targetMember Member @relation("target", fields: [targetUserId], references: [userId], onDelete: Cascade)

  @@id([sourceUserId, targetUserId])
}
```

- **Cardinality**: Many-to-many self-referential
- **Composite Primary Key**: Prevents duplicate likes
- **Cascade Delete**: Deleting member removes all likes

### User ↔ Story ↔ StoryView (1:N:N)

```prisma
model User {
  stories    Story[]
  storyViews StoryView[]
}

model Story {
  id    String      @id @default(cuid())
  user  User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  views StoryView[]
}

model StoryView {
  story   Story @relation(fields: [storyId], references: [id], onDelete: Cascade)
  viewer  User  @relation(fields: [viewerId], references: [id], onDelete: Cascade)

  @@unique([storyId, viewerId])
}
```

- One user creates many stories
- One story viewed by many users
- Unique constraint prevents duplicate views

### User ↔ AIConversation ↔ AIMessage (1:N:N)

```prisma
model User {
  aiConversations AIConversation[]
}

model AIConversation {
  id       String      @id @default(cuid())
  user     User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages AIMessage[]
}

model AIMessage {
  conversation AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

- One user has many conversations
- One conversation has many messages
- Cascade delete preserves data integrity

---

## Indexes and Performance

### Primary Indexes (Automatic)

- All `@id` fields automatically indexed
- All `@unique` fields automatically indexed

### Explicit Indexes

```prisma
model ProfileView {
  @@unique([viewerId, viewedId])
  @@index([viewedId]) // Fast "who viewed me" queries
}

model SmartMatchCache {
  @@index([userId, createdAt]) // Fast cache lookups
}

model Story {
  @@index([userId, isActive, expiresAt]) // Active stories per user
  @@index([expiresAt]) // Cleanup job efficiency
}

model AIMessage {
  @@index([conversationId, createdAt]) // Chronological message retrieval
}

model AIUsageLog {
  @@index([userId, createdAt]) // Rate limiting queries
}

model AIConversation {
  @@index([userId, isActive, updatedAt]) // Active conversations
}
```

### Query Optimization Examples

**Efficient Member Search**:

```typescript
// Good: Uses index on dateOfBirth for age filtering
const members = await prisma.member.findMany({
  where: {
    dateOfBirth: { gte: minDate, lte: maxDate },
    gender: { in: preferredGenders },
  },
  include: {
    interests: { select: { name: true } },
    photos: { where: { isApproved: true }, take: 1 },
  },
  orderBy: { created: "desc" },
  take: 20,
});
```

**Profile Views with Pagination**:

```typescript
// Efficient: Uses index on viewedId
const views = await prisma.profileView.findMany({
  where: { viewedId: userId, seen: false },
  include: {
    viewer: { select: { name: true, image: true } },
  },
  orderBy: { viewedAt: "desc" },
  take: 20,
  skip: (page - 1) * 20,
});
```

---

## Data Integrity

### Referential Integrity

**Cascade Deletes**:

- Deleting a `User` cascades to: Member, Transaction, ProfileView, Story, AIConversation, AIUsageLog
- Deleting a `Member` cascades to: Photo, Video, Interest, Like, Message, UserInteraction
- Deleting a `Story` cascades to: StoryView, StoryReaction, StoryReply
- Deleting an `AIConversation` cascades to: AIMessage

**Example**:

```prisma
model Member {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Constraints

**Unique Constraints**:

- `User.email` - Prevents duplicate emails
- `Member.userId` - One profile per user
- `Photo.publicId` - One photo per Cloudinary publicId
- `Like(sourceUserId, targetUserId)` - No duplicate likes
- `ProfileView(viewerId, viewedId)` - One view record per pair
- `StoryView(storyId, viewerId)` - One view per story per user
- `StoryReaction(storyId, userId)` - One reaction per story per user
- `Token(email, token)` - Unique tokens per email

**Check Constraints** (enforced at application level):

- Age must be 18+ (calculated from dateOfBirth)
- Premium expiration must be in the future
- Story expiration exactly 24 hours from creation
- Boost duration positive integer
- Match score between 0-100

---

## Migration Strategy

### Prisma Migrate

**Development Workflow**:

```bash
# Create migration
npx prisma migrate dev --name add_new_feature

# Apply migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

**Production Deployment**:

```bash
# Deploy migrations
npx prisma migrate deploy

# No down migrations (Prisma doesn't support rollbacks)
```

### Migration Naming Convention

```
20250313100729_add_premium_fields
20250313102612_add_boosted_until
20250808135727_add_user_preferences
YYYYMMDDHHMMSS_descriptive_name
```

### Zero-Downtime Migrations

**Strategy**:

1. **Additive Changes**: Add new nullable columns first
2. **Backfill Data**: Populate new columns with data migration
3. **Make Required**: Change columns to required after backfill
4. **Remove Old**: Drop old columns in separate migration

**Example** (adding a new required field):

```prisma
// Step 1: Add as nullable
model User {
  newField String?
}

// Step 2: Backfill data (seed script or server action)

// Step 3: Make required (new migration)
model User {
  newField String
}
```

### Data Seeding

**Seed Script**: `/prisma/seed.ts`

```bash
# Run seed
npm run seed-neon

# Or via Prisma
npx prisma db seed
```

**Seed Data**:

- 20+ sample users with complete profiles
- Photos and videos
- Interests across all categories
- Sample likes and messages
- Stories with various privacy levels

---

## Backup and Recovery

### Neon Automated Backups

- **Frequency**: Daily automated backups
- **Retention**: 7-day retention for free tier, 30-day for paid
- **Point-in-Time Recovery**: Available for paid plans
- **Manual Snapshots**: Can be triggered via Neon dashboard

### Disaster Recovery Plan

1. Restore from latest Neon backup
2. Re-run Prisma migrations if schema changed
3. Regenerate Prisma Client
4. Verify data integrity with test queries

---

## Database Performance Metrics

### Current Performance

- **Average Query Time**: < 50ms
- **Connection Pool**: 20 active connections (Neon handles pooling)
- **Database Size**: ~500MB (production)
- **Daily Transactions**: ~10K queries

### Optimization Strategies

- **Indexing**: All foreign keys and frequently queried fields indexed
- **Query Caching**: React Query + SmartMatchCache for expensive computations
- **Connection Pooling**: Prisma + Neon automatic pooling
- **Pagination**: All lists paginated (20-50 items per page)
- **Selective Queries**: Use `select` and `include` to fetch only needed data

---

## Future Database Enhancements

### Planned Additions

- **Read Replicas**: For scaling read-heavy operations
- **Full-Text Search**: PostgreSQL FTS or Algolia integration
- **Geospatial Indexing**: PostGIS for location-based queries
- **Partitioning**: Partition large tables (UserInteraction, AIMessage) by date
- **Audit Logs**: Track all data changes for compliance

---

_Last Updated: November 2025_
