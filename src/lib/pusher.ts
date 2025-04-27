import PusherServer from "pusher";
import PusherClient from "pusher-js";

const globalAny = global as any;

let pushServerInstance: PusherServer | undefined;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "development") {
    if (!globalAny._pusherServerInstance) {
      globalAny._pusherServerInstance = new PusherServer({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
        secret: process.env.PUSHER_SECRET!,
        cluster: "ap2",
        useTLS: true,
      });
    }
    pushServerInstance = globalAny._pusherServerInstance;
  } else {
    pushServerInstance = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: "ap2",
      useTLS: true,
    });
  }
}

let _pushClientInstance: PusherClient | undefined;

function initPusherClient(): PusherClient {
  if (!_pushClientInstance && typeof window !== "undefined") {
    _pushClientInstance = new PusherClient(
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

  return _pushClientInstance as PusherClient;
}

export const pusherServer = pushServerInstance as PusherServer;

export const pusherClient =
  typeof window !== "undefined"
    ? initPusherClient()
    : (null as unknown as PusherClient);

export function subscribeToPusher(channelName: string) {
  if (typeof window === "undefined") {
    throw new Error("subscribeToPusher can only be used on the client side");
  }
  return initPusherClient().subscribe(channelName);
}

export function unsubscribeFromPusher(channelName: string) {
  if (typeof window === "undefined" || !_pushClientInstance) return;
  _pushClientInstance.unsubscribe(channelName);
}
