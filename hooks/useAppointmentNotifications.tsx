import { useEffect } from "react";
import Pusher from "pusher-js";

export function useAppointmentNotifications(userId: string) {
  useEffect(() => {
    const pusher = new Pusher(process.env.PUSHER_KEY!, {
      cluster: process.env.PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(userId); // Subscribe to user's channel (either patient or staff)

    channel.bind("appointment-request", (data: any) => {
      alert(data.message); // Handle appointment request notification
    });

    channel.bind("appointment-response", (data: any) => {
      alert(data.message); // Handle appointment response notification
    });

    return () => {
      pusher.unsubscribe(userId);
    };
  }, [userId]);
}
