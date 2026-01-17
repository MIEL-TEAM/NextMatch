"use client";

import { useDeviceRouting } from "@/hooks/useDeviceRouting";

type DeviceRoutingProviderProps = {
  children: React.ReactNode;
  enabled?: boolean;
};

export default function DeviceRoutingProvider({
  children,
  enabled = true,
}: DeviceRoutingProviderProps) {
  const isReady = useDeviceRouting({ enabled });

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
