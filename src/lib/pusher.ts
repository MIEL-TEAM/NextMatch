import PusherServer from "pusher";
import PusherClient from "pusher-js";

declare global {
  interface GlobalThis {
    pushServerInstance?: PusherServer;
    pushClientInstance?: PusherClient;
  }
}

const globalForPusher = globalThis as GlobalThis;

if (!globalForPusher.pushServerInstance) {
  globalForPusher.pushServerInstance = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: "ap2",
    useTLS: true,
  });
}

if (!globalForPusher.pushClientInstance) {
  globalForPusher.pushClientInstance = new PusherClient(
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

export const pusherServer = globalForPusher.pushServerInstance;
export const pusherClient = globalForPusher.pushClientInstance;
