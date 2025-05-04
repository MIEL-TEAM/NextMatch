# Video Component System

This directory contains a comprehensive video handling system for the Miel Dating App, optimized for performance, accessibility, and user experience.

## Component Overview

- **VideoPlayer**: Core video playback component using ReactPlayer
- **VideoUpload**: Manages the video upload process with progress tracking
- **VideoCompression**: Handles client-side video compression
- **DragDropUpload**: UI for file selection with drag and drop support
- **UploadProgress**: Visual feedback for upload/compression progress
- **VideoSection**: Container that organizes videos in the profile section

## Architecture

The system uses a reducer-based state management approach for complex operations like uploading and playback:

```
User → DragDropUpload → VideoUpload → VideoCompression → Server
                      ↓
                UploadProgress
```

## Technical Features

- **Client-side Compression**: Reduces video size before upload for better performance
- **Resumable Uploads**: Automatic retry with exponential backoff
- **Adaptive Playback**: Handles various video formats and browser capabilities
- **Accessibility**: ARIA attributes and keyboard navigation throughout
- **Performance Optimizations**: Memoization, lazy loading, and efficient resource usage

## Image & Video Loading Strategies

### Image Best Practices

1. Use `priority` attribute only on above-the-fold critical images
2. Use `loading="lazy"` for images that are not initially visible
3. Use appropriate `sizes` attribute to help the browser select the right image size
4. Avoid preloading images that aren't immediately needed

### Video Best Practices

1. Set `preload="metadata"` for videos that may be played soon
2. Use poster images to improve perceived performance
3. Implement adaptive quality based on network conditions
4. Always set proper dimensions to avoid layout shifts
5. Lazy load videos that appear below the fold

## Mobile Considerations

- Videos are compressed for mobile data usage
- Touch-friendly controls with appropriate hit areas
- Optimized playback controls for mobile devices

## Error Handling

The system provides robust error handling with:

- User-friendly error messages in Hebrew
- Graceful fallbacks when operations fail
- Detailed console logging for debugging
- Upload retry mechanisms with backoff

## Maintenance

When modifying these components:

1. Maintain the separation of concerns between components
2. Preserve the accessibility features
3. Test on multiple browsers and devices
4. Keep dependencies up to date
5. Follow the established patterns for state management
