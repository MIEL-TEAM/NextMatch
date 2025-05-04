# Image and Video Optimization

## Image Loading Strategy

To ensure optimal performance and SEO:

1. Use `priority` attribute only on above-the-fold critical images
2. Use `loading="lazy"` for images that are not initially visible
3. Use appropriate `sizes` attribute to help the browser select the right image size
4. Avoid preloading images that aren't immediately needed

## Best Practices for Next.js Image Components

- Only use the `priority` attribute on LCP (Largest Contentful Paint) images
- Limit `priority` to 2-3 images per page that are visible in the viewport
- Use responsive image sizes with the `sizes` attribute
- Set appropriate `width` and `height` to avoid layout shifts

## Video Loading Strategy

For video components:

1. Set `preload="none"` for non-critical videos
2. Use `preload="metadata"` for videos that may be played soon
3. Only set `preload="auto"` for videos that users will very likely play immediately
4. Always set proper dimensions to avoid layout shifts
5. Implement `lazy loading` patterns for videos that appear below the fold

## Performance Tips

- Use compression for videos when possible
- Prefer MP4 format for broad compatibility
- Implement WebM for browsers that support it for better compression
- Use poster images for videos to improve perceived performance
- Consider using different video formats for mobile vs desktop users

Following these guidelines will help prevent console warnings about unused preloaded resources and improve your overall site performance and SEO.
