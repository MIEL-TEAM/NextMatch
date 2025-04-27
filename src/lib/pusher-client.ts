"use client";

import PusherClient from "pusher-js";

let _pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (typeof window === "undefined") {
    throw new Error("PusherClient can only be instantiated on the client side");
  }

  if (!_pusherClientInstance) {
    _pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        channelAuthorization: {
          endpoint: "/api/pusher-auth",
          transport: "ajax",
        },
        cluster: "ap2",
      }
    );
  }
  return _pusherClientInstance;
}

export function subscribeToPusher(channelName: string) {
  return getPusherClient().subscribe(channelName);
}

export function unsubscribeFromPusher(channelName: string) {
  if (_pusherClientInstance) {
    _pusherClientInstance.unsubscribe(channelName);
  }
}

export const pusherClient =
  typeof window !== "undefined"
    ? getPusherClient()
    : (null as unknown as PusherClient);
