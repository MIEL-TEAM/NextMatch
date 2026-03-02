import PusherServer from "pusher";

const globalAny = global as any;

let pushServerInstance: PusherServer | undefined;

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

export const pusherServer = pushServerInstance as PusherServer;
