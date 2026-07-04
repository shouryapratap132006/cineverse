import PusherClient from "pusher-js";

// Make sure to add these to your .env
// NEXT_PUBLIC_PUSHER_KEY=
// NEXT_PUBLIC_PUSHER_CLUSTER=

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
