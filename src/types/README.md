# Types Organization

This directory contains all TypeScript types and interfaces organized by domain/feature.

## Structure

### Core Types
- **`index.d.ts`** - Core application types (ActionResult, MessageDto, UserFilters, etc.)
- **`cookies.ts`** - Cookie-related types
- **`next-auth.d.ts`** - NextAuth session extensions
- **`userAction.ts`** - User action types

### Feature-Specific Types

#### Messaging & Chat
- **`chat.ts`** - All chat-related types
  - MessageListProps, ChatContainerProps, MessageBoxProps
  - Conversation, RecentConversationsProps
  - NewMessageToastProps, ChatButtonProps

- **`messageStore.ts`** - Zustand message store types
  - ChatCache, MessageState

#### Member Profiles
- **`profile.ts`** - Profile and member-related types
  - MemberWithUser, ProfileViewProps
  - PresenceProps, MemberImageProps
  - InterestsSectionProps, EditFormProps

- **`members.ts`** - Member card and display types

#### Stories
- **`story.ts`** - Core story data types
- **`stories.ts`** - Story UI component types

#### Smart Matches
- **`smart-matches.ts`** - Smart matching algorithm types

### UI Components
- **`components.ts`** - Reusable component props
  - Modal, Card, Button, Toast components
  - Provider and Container components

- **`navigation.ts`** - Navigation-related types
  - NavLink, TopNav, UserMenu, Sidebar types

### Pages & Routing
- **`params.ts`** - Page params and layout props
  - URL parameters (UserParamsProps, etc.)
  - Layout component props

### Data & State
- **`hooks.ts`** - Custom hook types
  - Store types (Pagination, Filter, Presence)
  - Device routing types

- **`tables.ts`** - Table and list component types
  - MessageTable, Lists, SmartMatches

### Authentication
- **`auth.ts`** - Authentication form and flow types
  - Login, Register, Verify email types

## Usage

Import types from their specific domain files:

```typescript
// Chat types
import { MessageListProps, Conversation } from "@/types/chat";

// Profile types
import { MemberWithUser, ProfileHeaderProps } from "@/types/profile";

// Component types
import { AppModalProps, CardWrapperProps } from "@/types/components";

// Hook types
import { PaginationState, FilterState } from "@/types/hooks";
```

## Benefits

1. **Better Organization** - Types grouped by feature/domain
2. **Easier Navigation** - Find types quickly
3. **Reduced Duplication** - Shared types in one place
4. **Better IntelliSense** - IDE can suggest relevant types
5. **Maintainability** - Easy to update and refactor

## Adding New Types

When creating new types:
1. Determine which domain it belongs to
2. Add to existing file or create new domain file
3. Export the type
4. Update this README if adding new domain file
