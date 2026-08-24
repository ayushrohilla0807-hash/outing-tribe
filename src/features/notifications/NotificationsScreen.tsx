import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCheck, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useNotifications } from "./hooks/useNotifications";
import NotificationCard from "./widgets/NotificationCard";
import type { Notification } from "./models/notification";

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    clearAll,
    refetch,
  } = useNotifications();

  // Mark all unread notifications as read when the user views the notifications page
  useEffect(() => {
    if (unreadCount > 0) {
      const timer = setTimeout(() => {
        markAllAsRead();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [unreadCount, markAllAsRead]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate({ to: notification.link });
    }
  };

  const handleClearAll = async () => {
    try {
      setClearing(true);
      await clearAll();
      setConfirmClearOpen(false);
      toast.success("All notifications cleared.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to clear notifications.");
    } finally {
      setClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading notifications...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8 text-center">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">Notifications</h1>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-medium">Failed to load notifications.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-foreground truncate">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground shadow-sm animate-pulse shrink-0">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                <span>Mark all as read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition cursor-pointer"
                aria-label="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] py-20 text-center text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <Bell className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-base font-semibold text-foreground mt-2">No notifications yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              When you receive join requests, confirmations, or outing updates, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {confirmClearOpen && (
        <div
          onClick={() => setConfirmClearOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-background p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">Clear all notifications?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This will remove all your notifications. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={clearing}
                onClick={() => setConfirmClearOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {clearing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Clear all</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
