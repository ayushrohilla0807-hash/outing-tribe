import { useState, useRef } from "react";
import { Download, FileText, X, Trash2, Ban } from "lucide-react";
import type { Message } from "../models/message";
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

export default function MessageBubble({ message, isLastInGroup = true, onDelete }: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDeleted = message.message === "This message was deleted";
  const parsed = parseMessageContent(message.message);

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

            {/* Timestamp */}
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
            </div>
          </div>
        </div>
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
              in this chat.
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
    </>
  );
}
