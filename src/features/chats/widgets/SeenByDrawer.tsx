import { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";
import type { MessageReadReceipt } from "../models/message";

interface SeenByDrawerProps {
  open: boolean;
  onClose: () => void;
  reads: MessageReadReceipt[];
}

function formatSeenTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Seen ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Seen Yesterday at ${timeStr}`;
  }

  return `Seen ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
}

export default function SeenByDrawer({ open, onClose, reads }: SeenByDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sort most recently seen first
  const sortedReads = useMemo(() => {
    return [...reads].sort((a, b) => new Date(b.seenAt).getTime() - new Date(a.seenAt).getTime());
  }, [reads]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="seen-by-title"
        className="relative z-10 mx-auto flex w-full max-w-lg max-h-[85vh] max-h-[85dvh] flex-col rounded-t-3xl border-t border-white/15 bg-zinc-950 p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl backdrop-blur-2xl transition-transform animate-in slide-in-from-bottom duration-250 ease-out text-foreground"
      >
        {/* Drag handle */}
        <div className="mb-3 flex justify-center shrink-0">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCheck className="h-5 w-5 text-primary" />
            <h2 id="seen-by-title" className="text-lg font-bold tracking-tight text-foreground">
              Seen by
            </h2>
            <span className="rounded-full bg-primary/15 border border-primary/25 px-2 py-0.5 text-xs font-semibold text-primary">
              {sortedReads.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewers List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2 pr-1">
          {sortedReads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-sm font-medium">No one has seen this message yet</p>
            </div>
          ) : (
            sortedReads.map((read) => {
              const initials = (read.userName || "M")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={read.id || `${read.messageId}-${read.userId}`}
                  className="flex items-center justify-between rounded-2xl p-2.5 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 border border-white/15 shrink-0 shadow-sm">
                      {read.userAvatar ? (
                        <AvatarImage
                          src={getOptimizedImageUrl(read.userAvatar, "thumb")}
                          alt={read.userName}
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {read.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatSeenTime(read.seenAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
