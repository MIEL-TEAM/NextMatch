# Invitation System - Backend-First Architecture

## Overview

This document describes the invitation system that ensures users see match invitations reliably, even if they log in hours or days after a match occurs.

## Architecture Principles

### 1. **Backend-First (Database is Source of Truth)**
- All invitations are persisted in the database
- Frontend state is ephemeral and rebuilt from backend
- Real-time events (Pusher) provide instant delivery but are NOT required
- Users fetch pending invitations on every app load/login

### 2. **Strict Anti-Spam Rules**
- **ONE active invitation maximum** per user at any time
- Status `pending` or `seen` = active (blocks new invitations)
- **12-hour cooldown** after `dismiss` or `accept` before new invitation
- No invitation queuing - new matches don't spam users

### 3. **Deterministic Behavior**
- Easy to reason about: check database, see current state
- No race conditions from event-based systems
- Clear state transitions with timestamps

---

## Database Schema

```prisma
model Invitation {
  id             String   @id @default(cuid())
  recipientId    String   // User who receives the invitation
  senderId       String   // User who triggered the invitation
  type           String   @default("chat")
  status         String   @default("pending")
  
  createdAt      DateTime @default(now())
  seenAt         DateTime?
  dismissedAt    DateTime?
  acceptedAt     DateTime?
  expiresAt      DateTime?
  
  recipient      User     @relation("RecipientInvitations")
  sender         User     @relation("SenderInvitations")
  
  @@index([recipientId, status, createdAt(sort: Desc)])
  @@index([recipientId, dismissedAt])
  @@index([recipientId, acceptedAt])
}
```

**Why these indexes?**
- `[recipientId, status, createdAt]` - Fast fetch of pending invitations on login
- `[recipientId, dismissedAt]` - Fast cooldown check for dismissed invitations
- `[recipientId, acceptedAt]` - Fast cooldown check for accepted invitations

---

## State Machine

```
pending → seen → accepted ✓ (starts cooldown)
                ↘ dismissed ✓ (starts cooldown)
                ↘ expired ✓ (auto-cleanup after 24h)
```

**State Descriptions:**
- `pending` - Invitation created, not yet seen by user
- `seen` - User saw the invitation card (auto-marked on display)
- `accepted` - User clicked to chat (navigated to conversation)
- `dismissed` - User clicked X to dismiss
- `expired` - Auto-expired after 24 hours (optional cleanup)

---

## Backend Logic

### Creating Invitations

**File:** `src/lib/db/invitationActions.ts`

**Function:** `dbCreateInvitation(recipientId, senderId, type)`

**Anti-Spam Checks (happens BEFORE creating invitation):**

1. **Check active invitations:**
   ```sql
   SELECT * FROM invitations 
   WHERE recipientId = ? 
   AND status IN ('pending', 'seen')
   ```
   If exists → **Block** (return null)

2. **Check cooldown:**
   ```sql
   SELECT * FROM invitations
   WHERE recipientId = ?
   AND (dismissedAt >= NOW() - 12 HOURS 
        OR acceptedAt >= NOW() - 12 HOURS)
   ```
   If exists → **Block** (return null)

3. **If both checks pass → Create invitation**

**Why this prevents spam:**
- User can only have ONE invitation visible at a time
- After dismissing/accepting, 12-hour cooldown prevents re-spamming
- No notification fatigue

---

## API Endpoints

### `GET /api/invitations`
**Purpose:** Fetch all pending invitations for current user  
**Called:** On app load, login  
**Returns:** Array of invitations with `status IN ('pending', 'seen')`

### `POST /api/invitations/:id/seen`
**Purpose:** Mark invitation as seen (auto-called when displayed)  
**Transition:** `pending → seen`

### `POST /api/invitations/:id/dismiss`
**Purpose:** User dismissed invitation (clicked X)  
**Transition:** `pending/seen → dismissed`  
**Effect:** Starts 12-hour cooldown

### `POST /api/invitations/:id/accept`
**Purpose:** User accepted invitation (clicked to chat)  
**Transition:** `pending/seen → accepted`  
**Effect:** Starts 12-hour cooldown

---

## Frontend Flow

### 1. **App Startup** (`useInvitationLoader`)

```typescript
// src/hooks/useInvitationLoader.ts

On app load:
  1. Fetch GET /api/invitations
  2. If invitations exist:
     - Show FIRST invitation (anti-spam: one at a time)
     - Auto-mark as "seen" via API
  3. User actions:
     - Click card → Accept + Navigate to chat
     - Click X → Dismiss
```

### 2. **Real-Time Delivery** (`useCelebrationListener`)

```typescript
// src/hooks/useCelebrationListener.ts

Pusher event "match:online" received:
  1. Fetch invitation from backend (to get database ID)
  2. Display invitation card
  3. Auto-mark as "seen"
  4. User actions tracked with database ID
```

**Why fetch from backend even with Pusher event?**
- Need database invitation ID to mark as seen/accepted/dismissed
- Ensures backend and frontend stay in sync
- Handles edge case where event arrives before database write completes

### 3. **State Management** (`useInvitationStore`)

```typescript
// src/hooks/useInvitationStore.ts

- Stores current invitation in Zustand (UI state)
- Auto-dismiss timer (15 minutes)
- dismiss() syncs with backend API
- show() auto-marks as "seen" on backend
```

---

## Match Creation Integration

### Mutual Like Match (`likeActions.ts`)

```typescript
When User A likes User B (and B already liked A):
  1. Create Like record (existing logic)
  2. ✨ Create invitations in database for BOTH users
     - dbCreateInvitation(userA, userB) → may return null if userA has active/cooldown
     - dbCreateInvitation(userB, userA) → may return null if userB has active/cooldown
  3. Send celebration event via Pusher (best-effort)
  4. ✨ Send invitation event ONLY if invitation was created
     - Prevents spam when user is in cooldown
```

### Online Announcement (`presenceActions.ts`)

```typescript
When User A comes online:
  1. Find mutual matches
  2. ✨ Create invitations for each match
     - dbCreateInvitation(matchUserId, onlineUserId)
     - Anti-spam: Only creates if allowed
  3. ✨ Send Pusher events ONLY for created invitations
     - Skips users in cooldown
     - Logs "Skipped user (cooldown)"
```

---

## Anti-Spam Examples

### Example 1: User Already Has Active Invitation

```
User A state: Has pending invitation from User B
User C comes online (mutual match with User A)

Flow:
1. presenceActions tries: dbCreateInvitation(userA, userC)
2. Check finds: userA has active invitation (from userB)
3. Returns: null (blocked)
4. Result: User A sees invitation from User B only
5. Logs: "Skipped userA (active invitation)"
```

### Example 2: User Recently Dismissed

```
User A dismisses invitation at 10:00 AM
User C tries to send invitation at 2:00 PM (4 hours later)

Flow:
1. dbCreateInvitation(userA, userC)
2. Cooldown check: dismissedAt = 10:00 AM, now = 2:00 PM
3. Time since dismiss: 4 hours < 12 hours cooldown
4. Returns: null (blocked)
5. Result: User A protected from spam
6. Logs: "User in cooldown (8h remaining)"
```

### Example 3: User Accepts Invitation

```
User A accepts invitation at 10:00 AM, chats with User B
User C comes online at 11:00 AM (mutual match)

Flow:
1. dbCreateInvitation(userA, userC)
2. Cooldown check: acceptedAt = 10:00 AM, now = 11:00 AM
3. Time since accept: 1 hour < 12 hours
4. Returns: null (blocked)
5. Result: User A can focus on conversation with User B
```

---

## Testing Scenarios

### ✅ Scenario 1: Offline User Receives Match
```
1. User A and User B match at 10:00 AM
2. User A is online → sees invitation immediately (Pusher)
3. User B is offline → misses Pusher event
4. User B logs in at 5:00 PM
5. useInvitationLoader fetches invitations
6. User B sees invitation from User A ✓
```

### ✅ Scenario 2: Multiple Matches During Offline
```
1. User A offline
2. User B, C, D all match with User A (3 matches)
3. Database has 3 pending invitations for User A
4. User A logs in
5. useInvitationLoader shows FIRST invitation only
6. User A dismisses → cooldown starts
7. Other 2 invitations blocked by cooldown ✓
```

### ✅ Scenario 3: Cooldown Protection
```
1. User A dismisses invitation at 10:00 AM
2. 5 new matches occur between 10:00 AM - 10:00 PM
3. None create invitations (cooldown active)
4. At 10:01 PM (12 hours later), cooldown expires
5. Next match creates invitation ✓
```

---

## Scalability Considerations

### Database Performance
- **Indexes** ensure fast queries even with millions of invitations
- **Cleanup job** (optional) archives expired invitations
- **Partitioning** can be added later by `createdAt` if needed

### Network Efficiency
- Only ONE fetch on app load (GET /api/invitations)
- Updates are single POST calls (seen/dismiss/accept)
- No polling - relies on single fetch + real-time events

### User Experience
- **No notification fatigue** - strict one-at-a-time rule
- **Reliable delivery** - database persistence guarantees visibility
- **Clear expectations** - consistent behavior across sessions

---

## Optional Enhancements (Future)

1. **Priority System**
   - Premium users get higher priority
   - Smart match invitations override regular matches
   - Modify: Add `priority` field, sort by priority in fetch

2. **Invitation Types**
   - `chat` (current)
   - `date` (suggest meeting location)
   - `call` (video/voice call invitation)

3. **Expiration Enforcement**
   - Cron job: Mark invitations older than 24h as expired
   - Auto-cleanup to prevent database bloat

4. **Analytics**
   - Track acceptance rate
   - A/B test cooldown duration
   - Monitor dismissed reasons

---

## Migration Guide

### Existing Users
- All existing matches continue to work
- New invitation system runs in parallel
- Old Pusher events still fire (backward compatible)
- No data migration needed

### Rollback Plan
- Keep old event-based system in `useCelebrationListener`
- Can disable database creation in `likeActions` if needed
- Feature flag: `ENABLE_INVITATION_SYSTEM=true`

---

## Monitoring & Debugging

### Key Metrics
```sql
-- Active invitations count
SELECT COUNT(*) FROM invitations 
WHERE status IN ('pending', 'seen');

-- Cooldown users count
SELECT COUNT(DISTINCT recipientId) FROM invitations
WHERE dismissedAt >= NOW() - INTERVAL '12 hours'
   OR acceptedAt >= NOW() - INTERVAL '12 hours';

-- Acceptance rate
SELECT 
  COUNT(CASE WHEN status = 'accepted' THEN 1 END) * 100.0 / COUNT(*) as acceptance_rate
FROM invitations
WHERE createdAt >= NOW() - INTERVAL '7 days';
```

### Debug Logs
- `[Invitation] Created invitation {id} for {user}` - Successful creation
- `[Invitation] User {id} has active invitation` - Blocked by active rule
- `[Invitation] User {id} in cooldown (Xh remaining)` - Blocked by cooldown
- `[InvitationLoader] Loaded invitation from {name}` - Fetch on login
- `[announceUserOnline] Skipped {user} (cooldown)` - Presence announcement blocked

---

## Summary

This invitation system provides:
- ✅ **Reliable delivery** - Database persistence ensures visibility
- ✅ **Anti-spam protection** - One invitation at a time, 12-hour cooldown
- ✅ **Scalability** - Indexed queries, deterministic behavior
- ✅ **User experience** - No notification fatigue, clear expectations
- ✅ **Maintainability** - Simple state machine, easy debugging

**Core principle:** Database is truth, events are enhancements.
