import { useState } from "react";
import { Download, FileText, X } from "lucide-react";
import type { Message } from "../models/message";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

export default function MessageBubble({ message }: Props) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const parsed = parseMessageContent(message.message);

  return (
    <>
      <div className={`mb-3 flex ${message.isMine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-3 shadow-sm transition ${
            message.isMine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-white/10 bg-card text-foreground"
          }`}
        >
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
          {parsed.text && <p className="break-words text-sm leading-relaxed px-1">{parsed.text}</p>}

          {/* Timestamp */}
          <div
            className={`mt-1.5 text-right text-[10px] px-1 ${
              message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
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
    </>
  );
}
