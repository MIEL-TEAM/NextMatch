import { useEffect, useState } from "react";

export function useDisableScrollOnlyIfNotNeeded() {
  const [shouldDisableScroll, setShouldDisableScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const needsScroll = scrollHeight > clientHeight;

        setShouldDisableScroll(!needsScroll);
      });
    };

    // Initial check with delay to allow async content to load
    const initialTimeout = setTimeout(() => {
      checkScroll();
    }, 100);

    // Re-check after a longer delay for slow-loading content
    const delayedCheck = setTimeout(() => {
      checkScroll();
    }, 1000);

    // Periodic checks as fallback (every 2 seconds for first 10 seconds)
    const periodicChecks: NodeJS.Timeout[] = [];
    for (let i = 0; i < 5; i++) {
      periodicChecks.push(
        setTimeout(
          () => {
            checkScroll();
          },
          2000 + i * 2000
        )
      );
    }

    const observer = new MutationObserver(() => {
      checkScroll();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: false,
    });

    window.addEventListener("resize", checkScroll);

    window.addEventListener("scroll", checkScroll, { passive: true });

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(delayedCheck);
      periodicChecks.forEach((timeout) => clearTimeout(timeout));
      observer.disconnect();
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("scroll", checkScroll);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = shouldDisableScroll ? "hidden" : "auto";
  }, [shouldDisableScroll]);
}
