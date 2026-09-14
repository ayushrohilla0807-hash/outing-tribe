import { useState } from "react";
import { Download, FileText, X, Check } from "lucide-react";
import type { Message } from "../models/message";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";
import SeenByDrawer from "./SeenByDrawer";

type Props = {
  message: Message;
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

export default function GroupMessageBubble({ message }: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [seenDrawerOpen, setSeenDrawerOpen] = useState(false);
  const parsed = parseMessageContent(message.message);

  const reads = message.reads ?? [];
  const displayedReads = reads.slice(0, 3);
  const extraCount = reads.length - displayedReads.length;

  const senderAvatarSrc = message.senderAvatar
    ? getOptimizedImageUrl(message.senderAvatar, "thumb")
    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <>
      <div className={`mb-3 flex flex-col w-full ${message.isMine ? "items-end" : "items-start"}`}>
        <div
          className={`flex items-end gap-2 w-full ${message.isMine ? "justify-end" : "justify-start"}`}
        >
          {/* Avatar for other participants */}
          {!message.isMine && (
            <img
              src={senderAvatarSrc}
              alt={message.senderName || "Member"}
              loading="lazy"
              decoding="async"
              className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0 mb-0.5"
            />
          )}

          <div
            className={`chat-bubble-container rounded-2xl p-3 shadow-sm transition ${
              message.isMine
                ? "rounded-br-md bg-primary text-primary-foreground"
                : "rounded-bl-md border border-white/10 bg-card text-foreground"
            }`}
            style={{
              width: "fit-content",
              minWidth: "100px",
              maxWidth: "min(80%, 540px)",
              flexShrink: 0,
            }}
          >
            {/* Sender Name in group for other members */}
            {!message.isMine && (
              <p
                className="mb-1 text-xs font-bold text-amber-400 select-none truncate"
                style={{ maxWidth: "100%", whiteSpace: "nowrap" }}
              >
                {message.senderName || "Member"}
              </p>
            )}

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
                    ? "bg-white/15 hover:bg-white/25 text-primary-foreground"
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
              <p
                className="chat-message-text select-text px-1"
                style={{
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  hyphens: "none",
                }}
              >
                {parsed.text}
              </p>
            )}

            {/* Timestamp */}
            <div
              className={`chat-message-timestamp mt-1.5 text-right px-1 select-none ${
                message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
              style={{ whiteSpace: "nowrap" }}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>

        {/* Read Receipt Indicator for current user's messages */}
        {message.isMine && (
          <div className="mr-1 mt-1">
            {reads.length > 0 ? (
              <button
                type="button"
                onClick={() => setSeenDrawerOpen(true)}
                className="flex items-center gap-1.5 py-0.5 px-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-95 transition cursor-pointer group"
                title="View who saw this message"
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
                {extraCount > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                    +{extraCount}
                  </span>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 select-none px-1">
                <Check size={11} className="opacity-70" />
                <span>Sent</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Dialog for Images */}
      {parsed.image && (
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
      {message.isMine && (
        <SeenByDrawer
          open={seenDrawerOpen}
          onClose={() => setSeenDrawerOpen(false)}
          reads={reads}
        />
      )}
    </>
  );
}
