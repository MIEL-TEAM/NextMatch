import { useEffect, useState } from "react";

export function useDisableScrollOnlyIfNotNeeded() {
  const [shouldDisableScroll, setShouldDisableScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShouldDisableScroll(
        document.documentElement.scrollHeight <= window.innerHeight
      );
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = shouldDisableScroll ? "hidden" : "auto";
  }, [shouldDisableScroll]);
}
