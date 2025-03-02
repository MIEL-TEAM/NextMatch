import { useState, useEffect } from "react";

export function useIsMobile(threshold: number = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= threshold);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= threshold);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [threshold]);

  return isMobile;
}

export function isMobileDevice(threshold: number = 768) {
  return window.innerWidth <= threshold;
}

export function getToastStyle() {
  const isMobile = isMobileDevice();
  return {
    width: isMobile ? "90%" : "250px",
    margin: "0 auto",
    borderRadius: "10px",
    color: "white",
  };
}
