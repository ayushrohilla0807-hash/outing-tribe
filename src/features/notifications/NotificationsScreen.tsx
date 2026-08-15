import { useEffect, useState } from "react";
import { Loader2, Bell } from "lucide-react";
import { getNotifications } from "./services/notificationService";
import NotificationCard from "./widgets/NotificationCard";
import type { Notification } from "./models/notification";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 pb-32">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        {unreadCount > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <Bell className="h-10 w-10 opacity-30" />
          <p className="text-sm">No notifications yet.</p>
          <p className="text-xs">Join or host outings to receive updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
