import { useState, useRef, useMemo } from "react";
import { Download, FileText, X, Check, Trash2, Ban } from "lucide-react";
import type { Message, MessageReadReceipt } from "../models/message";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";
import SeenByDrawer from "./SeenByDrawer";

type Props = {
  message: Message;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isLatestInChat?: boolean;
  onDelete?: (messageId: string) => Promise<void> | void;
};

interface ParsedMessage {
  image?: string;
  file?: {
    url: string;
    name: string;
  };
  text: string;
}

function parseMessageContent(raw: string): ParsedMessage {
  const imageMatch = raw.match(
    /^\[image:(https?:\/\/[^\s\]]+|data:image\/[^;]+;base64,[^\s\]]+)\]\s*(.*)$/s,
  );
  if (imageMatch) {
    return {
      image: imageMatch[1],
      text: imageMatch[2] || "",
    };
  }

  const fileMatch = raw.match(
    /^\[file:(https?:\/\/[^\s:]+|data:[^;]+;base64,[^\s:]+):([^\]]+)\]\s*(.*)$/s,
  );
  if (fileMatch) {
    return {
      file: {
        url: fileMatch[1],
        name: fileMatch[2],
      },
      text: fileMatch[3] || "",
    };
  }

  return { text: raw };
}

const SENDER_COLORS = [
  "text-amber-400",
  "text-emerald-400",
  "text-sky-400",
  "text-violet-400",
  "text-rose-400",
  "text-cyan-400",
  "text-fuchsia-400",
  "text-teal-400",
];

function getSenderColor(nameOrId: string): string {
  if (!nameOrId) return SENDER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SENDER_COLORS.length;
  return SENDER_COLORS[index];
}

export default function GroupMessageBubble({
  message,
  isFirstInGroup = true,
  isLastInGroup = true,
  isLatestInChat = false,
  onDelete,
}: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [seenDrawerOpen, setSeenDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDeleted = message.message === "This message was deleted";
  const parsed = parseMessageContent(message.message);

  // Deduplicate and filter read receipts for the message (exclude sender)
  const reads = useMemo(() => {
    const rawReads = message.reads ?? [];
    const seenUserIds = new Set<string>();
    const deduplicated: MessageReadReceipt[] = [];

    for (const r of rawReads) {
      if (!r.userId || r.userId === message.senderId) continue;
      if (!seenUserIds.has(r.userId)) {
        seenUserIds.add(r.userId);
        deduplicated.push(r);
      }
    }
    return deduplicated;
  }, [message.reads, message.senderId]);

  const displayedReads = reads.slice(0, 3);
  const extraCount = reads.length - displayedReads.length;

  const senderAvatarSrc = message.senderAvatar
    ? getOptimizedImageUrl(message.senderAvatar, "thumb")
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  // Long press handler for mobile
  const handleTouchStart = () => {
    if (!message.isMine || isDeleted) return;
    longPressTimerRef.current = setTimeout(() => {
      setDeleteDialogOpen(true);
    }, 550);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !message.isMine || isDeleted) return;
    try {
      setIsDeleting(true);
      await onDelete(message.id);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col w-full min-w-0 transition-all ${
          isLastInGroup ? "mb-2.5" : "mb-1"
        } ${message.isMine ? "items-end" : "items-start"}`}
      >
        <div
          className={`group/row relative flex items-end gap-2 max-w-full min-w-0 ${
            message.isMine ? "justify-end" : "justify-start"
          }`}
        >
          {/* Avatar for other participants — shown on last message of consecutive group */}
          {!message.isMine &&
            (isLastInGroup ? (
              <img
                src={senderAvatarSrc}
                alt={message.senderName || "Member"}
                loading="lazy"
                decoding="async"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-white/15 shrink-0 mb-0.5 shadow-sm"
              />
            ) : (
              <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 mb-0.5" aria-hidden="true" />
            ))}

          {/* Delete Action button for own messages (Desktop hover / focus) */}
          {message.isMine && !isDeleted && (
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 self-center cursor-pointer shrink-0"
              title="Delete message"
              aria-label="Delete message"
            >
              <Trash2 size={14} />
            </button>
          )}

          {/* Message Bubble Container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            className={`chat-bubble-container relative rounded-2xl px-3.5 py-2.5 shadow-sm transition-all select-text min-w-[75px] max-w-[82%] sm:max-w-[72%] md:max-w-[62%] break-words ${
              isDeleted
                ? "border border-dashed border-white/15 bg-white/[0.03] text-muted-foreground/80 backdrop-blur-sm"
                : message.isMine
                  ? "rounded-br-xs bg-primary/20 border border-primary/35 text-zinc-100 backdrop-blur-sm shadow-black/20"
                  : "rounded-bl-xs border border-white/10 bg-white/[0.06] dark:bg-white/[0.07] text-zinc-100 backdrop-blur-sm shadow-black/20"
            }`}
          >
            {/* Sender Name — rendered ONLY on the first message of a consecutive sender group */}
            {!message.isMine && isFirstInGroup && !isDeleted && (
              <p
                className={`mb-1 text-xs font-bold select-none truncate ${getSenderColor(
                  message.senderName || message.senderId,
                )}`}
              >
                {message.senderName || "Member"}
              </p>
            )}

            {/* Deleted Message State */}
            {isDeleted ? (
              <div className="flex items-center gap-1.5 py-0.5 text-xs italic text-muted-foreground/80 select-none">
                <Ban size={13} className="opacity-70 shrink-0" />
                <span>This message was deleted</span>
              </div>
            ) : (
              <>
                {/* Image Attachment */}
                {parsed.image && (
                  <div className="mb-2 overflow-hidden rounded-xl bg-black/20">
                    <img
                      src={parsed.image}
                      alt="Attachment"
                      onClick={() => setImageModalOpen(true)}
                      className="max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* File Attachment */}
                {parsed.file && (
                  <a
                    href={parsed.file.url}
                    download={parsed.file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mb-2 flex items-center gap-3 rounded-xl p-2.5 transition ${
                      message.isMine
                        ? "bg-white/10 hover:bg-white/15 text-zinc-100"
                        : "bg-white/5 hover:bg-white/10 text-foreground"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-semibold">{parsed.file.name}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">Click to download</p>
                    </div>
                    <Download size={16} className="opacity-75 flex-shrink-0" />
                  </a>
                )}

                {/* Message Text */}
                {parsed.text && (
                  <p className="chat-message-text select-text text-[13.5px] sm:text-sm leading-relaxed [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">
                    {parsed.text}
                  </p>
                )}
              </>
            )}

            {/* Timestamp & Delivery Indicator */}
            <div
              className={`mt-1 flex items-center justify-end gap-1 text-[10px] tracking-tight select-none ${
                isDeleted
                  ? "text-muted-foreground/60"
                  : message.isMine
                    ? "text-zinc-400"
                    : "text-zinc-400"
              }`}
            >
              <span>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {message.isMine &&
                !isDeleted &&
                (reads.length > 0 ? (
                  <span className="text-primary font-bold ml-0.5" title="Read by members">
                    ✓✓
                  </span>
                ) : (
                  <Check size={12} className="opacity-70 ml-0.5 text-zinc-400" />
                ))}
            </div>
          </div>
        </div>

        {/* Read Receipt Avatars: Rendered for the latest message in the entire conversation */}
        {isLatestInChat && !isDeleted && (
          <div className="mr-1 mt-1">
            {reads.length > 0 ? (
              <button
                type="button"
                onClick={() => setSeenDrawerOpen(true)}
                className="flex items-center gap-1.5 py-0.5 px-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer group"
                title="View who saw this message"
                aria-label="View who saw this message"
              >
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  {displayedReads.map((r) => {
                    const initials = (r.userName || "M")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase();
                    return (
                      <Avatar
                        key={r.userId}
                        className="h-4 w-4 rounded-full border border-background ring-1 ring-white/10 shrink-0"
                      >
                        {r.userAvatar ? (
                          <AvatarImage
                            src={getOptimizedImageUrl(r.userAvatar, "thumb")}
                            alt={r.userName}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary/30 text-[8px] font-bold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                  {extraCount > 0 ? `+${extraCount}` : "Seen"}
                </span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Message Deletion */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm rounded-2xl bg-card border border-white/10 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Delete message?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This message will be replaced with &quot;This message was deleted&quot; for everyone
              in this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox / Zoom Dialog for Images */}
      {parsed.image && !isDeleted && (
        <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-0 text-white">
            <div className="relative flex items-center justify-center min-h-[50vh] p-2">
              <img
                src={parsed.image}
                alt="Full size attachment"
                className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Seen By Drawer / Bottom Sheet */}
      {isLatestInChat && !isDeleted && (
        <SeenByDrawer
          open={seenDrawerOpen}
          onClose={() => setSeenDrawerOpen(false)}
          reads={reads}
        />
      )}
    </>
  );
}
