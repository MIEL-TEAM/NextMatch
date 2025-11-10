# API Endpoints Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [AI Assistant Endpoints](#ai-assistant-endpoints)
4. [Member Management](#member-management)
5. [Messaging](#messaging)
6. [Premium & Payments](#premium--payments)
7. [Stories](#stories)
8. [File Upload](#file-upload)
9. [Real-Time (Pusher)](#real-time-pusher)
10. [Webhooks](#webhooks)
11. [Analytics & Stats](#analytics--stats)
12. [Admin Endpoints](#admin-endpoints)

---

## Overview

The Miel Dating App exposes two types of server-side endpoints:

1. **Server Actions** (`/app/actions/*.ts`) - Preferred method for mutations and data fetching
2. **API Routes** (`/app/api/*/route.ts`) - Used for webhooks, external integrations, and specialized operations

### Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://miel-love.com`

### Authentication

Most endpoints require authentication via **NextAuth session**. Authentication is validated via:

- **Server Actions**: `await getAuthUserId()` checks session
- **API Routes**: `await auth()` returns session object

### Response Formats

- **Server Actions**: Return typed objects `{ success: boolean, data?: T, error?: string }`
- **API Routes**: Return JSON via `NextResponse.json()`

---

## Authentication

### POST `/api/auth/signin`

**Description**: Authenticate user with credentials or OAuth

**Request Body** (Credentials):

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**OAuth Flow**:

- Redirect to `/api/auth/signin/google` or `/api/auth/signin/facebook`
- OAuth provider handles authentication
- Callback to `/api/auth/callback/[provider]`

**Response**:

```json
{
  "url": "/members",
  "sessionToken": "encrypted-jwt-token"
}
```

**Server Action Alternative**:

```typescript
import { signIn } from "@/auth";

await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: true,
  redirectTo: "/members",
});
```

---

### POST `/api/auth/signout`

**Description**: Sign out current user

**Response**:

```json
{
  "url": "/login"
}
```

---

### GET `/api/auth/session`

**Description**: Get current session

**Response**:

```json
{
  "user": {
    "id": "clx123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://cloudinary.com/...",
    "role": "MEMBER"
  },
  "expires": "2025-12-31T23:59:59.999Z"
}
```

---

## AI Assistant Endpoints

### POST `/api/ai-assistant/chat`

**Description**: Send message to AI dating assistant

**Authentication**: Required

**Request**:

```json
{
  "message": "מצא לי התאמות מתאימות",
  "conversationHistory": [
    { "role": "user", "content": "היי" },
    { "role": "assistant", "content": "שלום! איך אוכל לעזור?" }
  ]
}
```

**Response**:

```json
{
  "messageId": "clx456",
  "content": "מצאתי 3 התאמות מעולות בשבילך...",
  "metadata": {
    "matches": [
      {
        "userId": "clx789",
        "name": "Sarah",
        "age": 28,
        "city": "Tel Aviv",
        "matchScore": 87,
        "reason": "בן 28 - בדיוק בטווח שחיפשת! 🎯"
      }
    ]
  },
  "tokensUsed": 245
}
```

**Rate Limiting**:

- Free users: 5 requests/day
- Premium users: 999 requests/day

**Status Codes**:

- `200`: Success
- `401`: Unauthorized
- `429`: Rate limit exceeded
- `500`: Server error

---

### GET `/api/ai-assistant/history`

**Description**: Get conversation history for current user

**Authentication**: Required

**Response**:

```json
{
  "conversations": [
    {
      "id": "clx123",
      "title": "שיחה חדשה",
      "isActive": true,
      "createdAt": "2025-11-10T10:00:00Z",
      "updatedAt": "2025-11-10T10:30:00Z",
      "messages": [
        {
          "id": "clxmsg1",
          "role": "user",
          "content": "היי, עזרה",
          "createdAt": "2025-11-10T10:00:00Z"
        },
        {
          "id": "clxmsg2",
          "role": "assistant",
          "content": "שמח לעזור!",
          "metadata": {},
          "tokensUsed": 15,
          "createdAt": "2025-11-10T10:00:05Z"
        }
      ]
    }
  ]
}
```

---

### DELETE `/api/ai-assistant/clear`

**Description**: Delete all AI conversation history for current user

**Authentication**: Required

**Response**:

```json
{
  "success": true,
  "deletedConversations": 3,
  "deletedMessages": 45
}
```

---

### GET `/api/ai-assistant/insights`

**Description**: Get user behavior insights from AI

**Authentication**: Required

**Response**:

```json
{
  "totalLikes": 25,
  "totalMessages": 42,
  "totalViews": 120,
  "activityLevel": "high",
  "successRate": 68,
  "recommendations": [
    "נסה להעלות עוד תמונות איכותיות",
    "השתמש בפתיחים יצירתיים בהודעות"
  ]
}
```

---

## Member Management

### Server Action: `getMembers()`

**Description**: Fetch paginated member list with filters

**File**: `/app/actions/memberActions.ts`

**Usage**:

```typescript
const members = await getMembers({
  pageNumber: "1",
  pageSize: "20",
  gender: "female",
  ageRange: [25, 35],
  orderBy: "newest",
});
```

**Response**:

```typescript
{
  items: Member[], // Array of member profiles
  totalCount: number
}
```

---

### Server Action: `getMemberByUserId(userId: string)`

**Description**: Get detailed member profile

**Usage**:

```typescript
const member = await getMemberByUserId("clx123");
```

**Response**:

```typescript
{
  id: string;
  userId: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  city: string;
  country: string;
  description: string;
  image: string;
  photos: Photo[];
  interests: Interest[];
  videos: Video[];
  user: {
    isPremium: boolean;
    role: "ADMIN" | "MEMBER";
  }
}
```

---

### Server Action: `updateMemberProfile(data: FormData)`

**Description**: Update member profile information

**Usage**:

```typescript
const formData = new FormData();
formData.append("name", "John Doe");
formData.append("description", "Updated bio");
formData.append("city", "Tel Aviv");

const result = await updateMemberProfile(formData);
```

**Response**:

```typescript
{
  success: boolean;
  member?: Member;
  error?: string;
}
```

---

### GET `/api/members`

**Description**: API endpoint for member search (alternative to Server Action)

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)
- `gender`: Filter by gender
- `minAge`: Minimum age
- `maxAge`: Maximum age
- `city`: Filter by city

**Response**:

```json
{
  "members": [...],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

## Messaging

### Server Action: `createMessgae(recipientId: string, data: { text: string })`

**Description**: Send a message to another user

**Usage**:

```typescript
const result = await createMessgae("clx789", {
  text: "היי, מה שלומך?",
});
```

**Side Effects**:

- Saves message to database
- Triggers Pusher real-time event to recipient
- Creates notification

**Response**:

```typescript
{
  status: "success" | "error";
  data?: Message;
  error?: string;
}
```

---

### Server Action: `getMessageThread(userId: string)`

**Description**: Get message conversation with specific user

**Usage**:

```typescript
const messages = await getMessageThread("clx789");
```

**Response**:

```typescript
Message[] // Array of messages, sorted by creation date
```

---

### GET `/api/messages`

**Description**: Get all message threads for current user

**Authentication**: Required

**Response**:

```json
{
  "threads": [
    {
      "userId": "clx789",
      "name": "Sarah Cohen",
      "image": "https://...",
      "lastMessage": {
        "text": "See you tomorrow!",
        "created": "2025-11-10T15:30:00Z",
        "isRead": true
      },
      "unreadCount": 0
    }
  ]
}
```

---

### Server Action: `markMessagesAsRead(recipientId: string)`

**Description**: Mark all messages from a user as read

**Usage**:

```typescript
await markMessagesAsRead("clx789");
```

---

## Premium & Payments

### Server Action: `createCheckoutSession(formData: FormData)`

**Description**: Create Stripe checkout session for premium subscription

**Usage**:

```typescript
const formData = new FormData();
formData.append("planId", "popular");
formData.append("months", "3");

const checkoutUrl = await createCheckoutSession(formData);
// Redirect user to checkoutUrl
```

**Plans**:

- `basic`: $9.99/month, 5 boosts
- `popular`: $24.99/quarter, 10 boosts
- `annual`: $79.99/year, 15 boosts

**Response**: Stripe checkout URL

---

### Server Action: `getPremiumStatus()`

**Description**: Get current user's premium subscription status

**Response**:

```typescript
{
  id: string;
  name: string;
  isPremium: boolean;
  premiumUntil: Date | null;
  boostsAvailable: number;
  canceledAt: Date | null;
  stripeSubscriptionId: string | null;
  member: {
    id: string;
    boostedUntil: Date | null;
  }
  activePlan: string;
}
```

---

### GET `/api/premium`

**Description**: Check premium status (API route alternative)

**Authentication**: Required

**Response**:

```json
{
  "isPremium": true,
  "premiumUntil": "2026-02-10T00:00:00Z",
  "boostsAvailable": 8,
  "plan": "popular"
}
```

---

### Server Action: `boostProfile(formData: FormData)`

**Description**: Use a profile boost (premium feature)

**Usage**:

```typescript
const formData = new FormData();
formData.append("boostHours", "24");
formData.append("useMultipleBoosts", "false");

const result = await boostProfile(formData);
```

**Response**:

```typescript
{
  success: boolean;
  boostsUsed: number;
  boostsAvailable: number;
  boostedUntil: Date;
  boostDuration: string;
}
```

---

### Server Action: `cancelPremium()`

**Description**: Cancel premium subscription

**Response**:

```typescript
{
  success: boolean;
  stripeUpdated: boolean;
  message: string;
  user: User;
}
```

---

### POST `/api/create-billing-portal`

**Description**: Create Stripe billing portal session

**Authentication**: Required

**Response**:

```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

---

## Stories

### Server Action: `createStory(formData: FormData)`

**Description**: Create a new 24-hour story

**Usage**:

```typescript
const formData = new FormData();
formData.append("imageUrl", "https://res.cloudinary.com/...");
formData.append("publicId", "stories/clx123/abc");
formData.append("textOverlay", "Hello World!");
formData.append("textX", "0.5");
formData.append("textY", "0.8");
formData.append("filter", "grayscale");
formData.append("privacy", "PUBLIC");

const result = await createStory(formData);
```

**Limitations**:

- Free users: 1 story per day
- Premium users: Unlimited

**Response**:

```typescript
{
  status: "success" | "error";
  data?: Story;
  error?: string;
}
```

---

### GET `/api/stories`

**Description**: Get all active stories from all users

**Authentication**: Required

**Response**:

```json
{
  "storyUsers": [
    {
      "id": "clx123",
      "name": "John Doe",
      "image": "https://...",
      "hasUnviewedStories": true,
      "totalStories": 3,
      "isCurrentUser": false
    }
  ]
}
```

---

### GET `/api/stories/[userId]`

**Description**: Get all stories for a specific user

**Authentication**: Required

**Response**:

```json
{
  "stories": [
    {
      "id": "clxstory1",
      "userId": "clx123",
      "imageUrl": "https://...",
      "textOverlay": "Hello!",
      "textX": 0.5,
      "textY": 0.8,
      "filter": "sepia",
      "privacy": "PUBLIC",
      "createdAt": "2025-11-10T12:00:00Z",
      "expiresAt": "2025-11-11T12:00:00Z",
      "isActive": true,
      "viewCount": 45,
      "reactionCount": 12,
      "hasViewed": false
    }
  ]
}
```

---

### POST `/api/stories/reactions`

**Description**: React to a story

**Authentication**: Required

**Request**:

```json
{
  "storyId": "clxstory1",
  "reactionType": "HEART"
}
```

**Reaction Types**: `HEART`, `FIRE`, `LOVE_EYES`, `EYES`

**Response**:

```json
{
  "status": "success",
  "data": "Reaction added"
}
```

---

### GET `/api/stories/analytics/[storyId]`

**Description**: Get story analytics (Premium feature)

**Authentication**: Required (Premium)

**Response**:

```json
{
  "status": "success",
  "data": {
    "storyId": "clxstory1",
    "totalViews": 45,
    "viewers": [
      {
        "id": "clxuser1",
        "name": "Sarah",
        "image": "https://...",
        "viewedAt": "2025-11-10T12:05:00Z"
      }
    ]
  }
}
```

---

### Server Action: `sendStoryMessage(storyId: string, messageText: string)`

**Description**: Send a direct message in response to a story

**Usage**:

```typescript
const result = await sendStoryMessage("clxstory1", "אהבתי את הסטורי!");
```

**Response**:

```typescript
{
  status: "success" | "error";
  data?: string;
  error?: string;
}
```

---

## File Upload

### POST `/api/sign-image`

**Description**: Generate signed parameters for Cloudinary upload

**Authentication**: Required

**Request**:

```json
{
  "paramsToSign": {
    "timestamp": "1699632000",
    "upload_preset": "miel_photos",
    "folder": "members/clx123"
  }
}
```

**Response**:

```json
{
  "signature": "abc123def456..."
}
```

**Usage Flow**:

1. Client requests signature
2. Client uploads directly to Cloudinary with signature
3. Cloudinary processes and stores image
4. Cloudinary webhook notifies server (see `/api/cloudinary-webhook`)

---

### POST `/api/videos/upload-url`

**Description**: Generate pre-signed S3 upload URL for videos

**Authentication**: Implicit (memberId in request)

**Request**:

```json
{
  "fileName": "intro.mp4",
  "fileType": "video/mp4",
  "memberId": "clx123"
}
```

**Response**:

```json
{
  "uploadUrl": "https://profile-videos-miel.s3.eu-north-1.amazonaws.com/...",
  "fileUrl": "https://profile-videos-miel.s3.eu-north-1.amazonaws.com/videos/clx123/1699632000-intro.mp4"
}
```

**Upload Flow**:

1. Client requests pre-signed URL
2. Client uploads directly to S3 using `uploadUrl` (PUT request)
3. Client notifies server via `/api/videos/save-url`

---

### POST `/api/videos/save-url`

**Description**: Save video URL to database after S3 upload

**Authentication**: Required

**Request**:

```json
{
  "memberId": "clx123",
  "videoUrl": "https://profile-videos-miel.s3.eu-north-1.amazonaws.com/..."
}
```

**Response**:

```json
{
  "success": true,
  "video": {
    "id": "clxvid1",
    "url": "https://...",
    "isApproved": false
  }
}
```

---

### DELETE `/api/videos/delete`

**Description**: Delete video from S3 and database

**Authentication**: Required

**Request**:

```json
{
  "videoId": "clxvid1"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Video deleted"
}
```

---

## Real-Time (Pusher)

### POST `/api/pusher-auth`

**Description**: Authenticate Pusher private channel subscription

**Authentication**: Required

**Request** (FormData):

```
socket_id: "123.456"
channel_name: "private-clx123"
```

**Response**:

```json
{
  "auth": "pusher_key:signature",
  "channel_data": "{\"user_id\":\"clx123\"}"
}
```

**Usage**:

```javascript
const pusher = new Pusher(PUSHER_KEY, {
  cluster: "eu",
  authEndpoint: "/api/pusher-auth",
});

const channel = pusher.subscribe("private-clx123");
channel.bind("message:new", (data) => {
  console.log("New message:", data);
});
```

---

## Webhooks

### POST `/api/webhooks/stripe`

**Description**: Handle Stripe webhook events

**Authentication**: Stripe signature verification

**Events Handled**:

- `checkout.session.completed`: Subscription activated
- `customer.subscription.updated`: Subscription modified
- `customer.subscription.deleted`: Subscription canceled

**Request** (Stripe sends):

```json
{
  "id": "evt_123",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_123",
      "customer": "cus_123",
      "subscription": "sub_123",
      "metadata": {
        "userId": "clx123",
        "planId": "popular",
        "months": "3"
      }
    }
  }
}
```

**Response**:

```json
{
  "received": true
}
```

**Side Effects**:

- Updates user premium status
- Adds profile boosts
- Sets premium expiration date
- Stores Stripe customer/subscription IDs

---

### POST `/api/cloudinary-webhook`

**Description**: Handle Cloudinary moderation notifications

**Authentication**: Cloudinary signature (not shown, trusted source)

**Request**:

```json
{
  "notification_type": "moderation",
  "public_id": "members/clx123/photo1",
  "moderation_status": "approved"
}
```

**Response**:

```
"Success" (HTTP 200)
```

**Side Effects**:

- Updates `Photo.isApproved` in database

---

## Analytics & Stats

### GET `/api/stats`

**Description**: Get user statistics

**Authentication**: Required

**Response**:

```json
{
  "profileViews": 120,
  "likesReceived": 45,
  "likesSent": 32,
  "matches": 12,
  "messages": 87,
  "storiesPosted": 15,
  "storyViews": 340
}
```

---

### GET `/api/profile-views`

**Description**: Get who viewed your profile

**Authentication**: Required

**Query Parameters**:

- `page`: Page number
- `limit`: Results per page

**Response**:

```json
{
  "views": [
    {
      "id": "clxview1",
      "viewerId": "clxuser1",
      "viewedAt": "2025-11-10T14:30:00Z",
      "seen": false,
      "viewer": {
        "id": "clxuser1",
        "name": "Sarah",
        "image": "https://...",
        "member": {
          "city": "Tel Aviv",
          "age": 28
        }
      }
    }
  ],
  "total": 45,
  "unseenCount": 12
}
```

---

### POST `/api/views`

**Description**: Track profile view

**Authentication**: Required

**Request**:

```json
{
  "viewedId": "clxuser1"
}
```

**Response**:

```json
{
  "success": true
}
```

**Side Effects**:

- Creates ProfileView record
- Increments view count for analytics

---

### POST `/api/views/seen`

**Description**: Mark profile views as seen

**Authentication**: Required

**Request**:

```json
{
  "viewIds": ["clxview1", "clxview2"]
}
```

**Response**:

```json
{
  "success": true,
  "markedAsSeen": 2
}
```

---

## Admin Endpoints

### GET `/api/admin/pending-photos`

**Description**: Get photos pending approval (Admin only)

**Authentication**: Required (Role: ADMIN)

**Response**:

```json
{
  "photos": [
    {
      "id": "clxphoto1",
      "url": "https://...",
      "memberId": "clx123",
      "member": {
        "name": "John Doe"
      },
      "createdAt": "2025-11-10T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/admin/approve-photo`

**Description**: Approve or reject photo (Admin only)

**Authentication**: Required (Role: ADMIN)

**Request**:

```json
{
  "photoId": "clxphoto1",
  "approved": true
}
```

**Response**:

```json
{
  "success": true,
  "photo": {
    "id": "clxphoto1",
    "isApproved": true
  }
}
```

---

## Smart Matches

### Server Action: `getSmartMatches(pageNumber, pageSize, filterGender?, filterAgeRange?)`

**Description**: Get AI-powered match recommendations

**Usage**:

```typescript
const matches = await getSmartMatches("1", "12", ["female"], [25, 35]);
```

**Response**:

```typescript
{
  items: (Member & { matchReason: string; matchScore: number })[];
  totalCount: number;
}
```

**Algorithm Factors**:

- Age compatibility (25 points)
- Location proximity (20 points)
- Shared interests (25 points)
- Personality matching (15 points)
- Behavioral patterns (15 points)

**Caching**: Results cached for 6 hours

---

### POST `/api/smart-matches/refresh-ai`

**Description**: Force refresh smart match cache

**Authentication**: Required

**Response**:

```json
{
  "success": true,
  "matchesComputed": 15
}
```

---

## Error Responses

### Common Error Codes

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| `400`       | Bad Request - Invalid parameters        |
| `401`       | Unauthorized - Not authenticated        |
| `403`       | Forbidden - Insufficient permissions    |
| `404`       | Not Found - Resource doesn't exist      |
| `429`       | Too Many Requests - Rate limit exceeded |
| `500`       | Internal Server Error                   |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "status": "error",
  "code": "ERROR_CODE"
}
```

---

## Rate Limiting

### AI Assistant

- **Free Users**: 5 queries/day
- **Premium Users**: 999 queries/day
- **Reset**: Daily at midnight UTC

### File Uploads

- **Images**: 10/hour per user
- **Videos**: 3/hour per user

### API Requests

- **General**: 100 requests/minute per user
- **Webhooks**: No limit (trusted sources)

---

## Pagination

All paginated endpoints follow this pattern:

**Query Parameters**:

- `page`: Page number (1-indexed)
- `limit`: Results per page (default: 20, max: 100)

**Response Format**:

```json
{
  "items": [...],
  "totalCount": 450,
  "page": 1,
  "totalPages": 23,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## Testing

### Using curl

**Authentication with curl**:

```bash
# Get session token first
curl -X POST https://miel-love.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# Use session token in subsequent requests
curl https://miel-love.com/api/members \
  -b cookies.txt
```

### Using Postman

1. **Set Base URL**: `{{baseUrl}}` = `https://miel-love.com`
2. **Authentication**: Use "Cookies" tab to manage session cookies
3. **Environment Variables**: Create variables for `baseUrl`, `userId`, etc.

---

_Last Updated: November 2025_
