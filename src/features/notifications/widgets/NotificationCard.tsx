import type { Notification } from "../models/notification";

interface Props {
  notification: Notification;
}

export default function NotificationCard({ notification }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 ${notification.read ? "bg-background" : "bg-primary/5"}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{notification.title}</h3>

        {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{notification.description}</p>

      <p className="mt-3 text-xs text-muted-foreground">{notification.time}</p>
    </div>
  );
}
