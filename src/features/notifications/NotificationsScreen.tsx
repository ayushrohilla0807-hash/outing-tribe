import { getNotifications } from "./services/notificationService";
import NotificationCard from "./widgets/NotificationCard";

export default function NotificationsScreen() {
  const notifications = getNotifications();

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-3xl font-bold">
        Notifications
      </h1>

      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}