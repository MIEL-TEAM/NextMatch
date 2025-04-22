export function transformImageUrl(
  url: string | null | undefined,
  width?: number,
  height?: number,
  format: "webp" | "avif" | "original" = "webp"
): string {
  if (!url) return "/images/user.png";

  if (url.startsWith("/images/")) return url;

  if (
    url.includes("storage.googleapis.com") ||
    url.includes("firebasestorage.googleapis.com")
  ) {
    const baseUrl = url.split("?")[0];
    const params = new URLSearchParams(url.split("?")[1] || "");

    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());

    if (format !== "original") params.set("format", format);

    params.set("q", "80");

    return `${baseUrl}?${params.toString()}`;
  }

  return url;
}

export function preloadImagesIfVisible(
  images: string[],
  priority: boolean = false
): void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window))
    return;

  const toPreload = images.filter(Boolean);

  if (priority) {
    toPreload.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = transformImageUrl(url);
      document.head.appendChild(link);
    });
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          toPreload.forEach((url) => {
            const img = new Image();
            img.src = transformImageUrl(url);
          });
          observer.disconnect();
        }
      });
    });

    observer.observe(document.body);
  }
}
