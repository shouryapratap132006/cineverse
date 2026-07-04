import PusherServer from "pusher";

// Make sure to add these to your .env
// PUSHER_APP_ID=
// PUSHER_KEY=
// PUSHER_SECRET=
// PUSHER_CLUSTER=

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});
