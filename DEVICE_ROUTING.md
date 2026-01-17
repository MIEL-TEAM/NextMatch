# Device-Based Routing System

## Overview

Automatic routing system that intelligently redirects users between mobile and desktop versions based on their screen size - **works in real-time when resizing!**

## How It Works

### 1. **Automatic Detection**
- Monitors screen width in real-time (threshold: 768px)
- Detects resize events with debouncing (150ms)
- Redirects automatically and seamlessly

### 2. **Bidirectional Routing**
```
Mobile Device (< 768px):
  /login      → /mobile/login
  /register   → /mobile/register

Desktop Device (≥ 768px):
  /mobile/login    → /login
  /mobile/register → /register
```

### 3. **Smart Behavior**
- ✅ Only redirects when necessary (checks current route)
- ✅ Debounced resize handling (prevents excessive redirects)
- ✅ Works on initial page load
- ✅ Responds to window resize events
- ✅ Seamless user experience

## Implementation

### Core Components

#### 1. **`useDeviceRouting` Hook**
Location: `src/hooks/useDeviceRouting.ts`

```typescript
useDeviceRouting({
  enabled: true,           // Enable/disable routing
  mobileThreshold: 768,    // Breakpoint in pixels
  debounceMs: 150         // Debounce delay
})
```

#### 2. **`DeviceRoutingProvider` Component**
Location: `src/components/auth/DeviceRoutingProvider.tsx`

Wraps pages to enable automatic routing:

```tsx
<DeviceRoutingProvider>
  <YourPageContent />
</DeviceRoutingProvider>
```

#### 3. **Device Detection Utilities**
Location: `src/lib/deviceDetection.ts`

- `getMobileAuthRedirect(path)` - Returns mobile route for desktop path
- `getDesktopAuthRedirect(path)` - Returns desktop route for mobile path

## Pages Using Device Routing

### Desktop Auth Pages
- `/login` → Redirects mobile users to `/mobile/login`
- `/register` → Redirects mobile users to `/mobile/register`

### Mobile Auth Pages
- `/mobile/login` → Redirects desktop users to `/login`
- `/mobile/register` → Redirects desktop users to `/register`

## Usage Example

```tsx
import DeviceRoutingProvider from "@/components/auth/DeviceRoutingProvider";

export default function LoginPage() {
  return (
    <DeviceRoutingProvider>
      <div className="h-screen w-screen overflow-hidden">
        <LoginForm />
      </div>
    </DeviceRoutingProvider>
  );
}
```

## Adding New Routes

To add new device-specific routes, update `deviceDetection.ts`:

```typescript
// For mobile redirects
export function getMobileAuthRedirect(currentPath: string): string | null {
  const mobileRoutes: Record<string, string> = {
    "/login": "/mobile/login",
    "/register": "/mobile/register",
    "/new-page": "/mobile/new-page",  // Add here
  };
  return mobileRoutes[currentPath] || null;
}

// For desktop redirects
export function getDesktopAuthRedirect(currentPath: string): string | null {
  const desktopRoutes: Record<string, string> = {
    "/mobile/login": "/login",
    "/mobile/register": "/register",
    "/mobile/new-page": "/new-page",  // Add here
  };
  return desktopRoutes[currentPath] || null;
}
```

## Technical Details

### Performance Optimizations
- **Debouncing**: Prevents excessive redirects during resize
- **Route checking**: Only redirects if target route differs from current
- **Clean-up**: Properly removes event listeners on unmount
- **Timeout management**: Clears pending timeouts to prevent memory leaks

### Browser Compatibility
- Works on all modern browsers
- Gracefully handles SSR (server-side rendering)
- Safe checks for `window` object availability

## Testing

### Manual Testing Steps

1. **Desktop → Mobile**:
   - Visit `/login` on desktop
   - Resize browser window to < 768px
   - Should automatically redirect to `/mobile/login`

2. **Mobile → Desktop**:
   - Visit `/mobile/login` on mobile
   - Resize browser window to ≥ 768px
   - Should automatically redirect to `/login`

3. **Direct Access**:
   - Open `/mobile/login` on desktop → redirects to `/login`
   - Open `/login` on mobile → redirects to `/mobile/login`

## Benefits

✅ **Seamless UX**: Users always see the right version for their device
✅ **SEO Friendly**: Proper canonical URLs for each version
✅ **Maintainable**: Centralized routing logic
✅ **Performant**: Debounced, optimized event handling
✅ **Flexible**: Easy to add new routes or adjust thresholds
✅ **Type-safe**: Full TypeScript support

## Future Enhancements

- Add tablet-specific routes (if needed)
- Server-side device detection (optional)
- User preference override (stay on mobile/desktop version)
- Analytics tracking for device switches
