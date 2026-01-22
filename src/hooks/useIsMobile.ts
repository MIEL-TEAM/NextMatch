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
    width: isMobile ? "calc(100% - 32px)" : "auto",
    maxWidth: isMobile ? "400px" : "350px",
    margin: isMobile ? "0 auto" : "0",
    borderRadius: isMobile ? "16px" : "12px",
    color: "white",
    padding: isMobile ? "12px 16px" : "10px 14px",
    fontSize: isMobile ? "14px" : "13px",
  };
}

export function getMobileToastContainerStyle() {
  const isMobile = isMobileDevice();
  return {
    top: isMobile ? "80px" : "24px", // Below mobile header
    right: isMobile ? "16px" : "24px",
    left: isMobile ? "16px" : "auto",
    bottom: isMobile ? "auto" : "24px",
  };
}
