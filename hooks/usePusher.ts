import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export function usePusher(channel: string, event: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === "undefined") return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to the channel
    const channelSubscription = pusher.subscribe(channel);

    // Bind to the event
    channelSubscription.bind(event, (receivedData: any) => {
      setData(receivedData);
    });

    // Cleanup subscription on unmount
    return () => {
      pusher.unsubscribe(channel);
    };
  }, [channel, event]);

  return data;
}
