import { Paperclip, Send, Smile, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker from "./EmojiPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  onSend: (text: string) => void;
};

interface PendingAttachment {
  file: File;
  previewUrl: string;
  type: "image" | "file";
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleEmojiSelect(emoji: string) {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 15 MB limit
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 15MB.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const previewUrl = URL.createObjectURL(file);

    setPendingAttachment({
      file,
      previewUrl,
      type: isImage ? "image" : "file",
      name: file.name,
      size: file.size,
    });

    // Reset input so same file can be selected again if needed
    e.target.value = "";
  }

  function removeAttachment() {
    if (pendingAttachment?.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  }

  async function send() {
    if ((!text.trim() && !pendingAttachment) || uploading) return;

    let finalMessage = text.trim();

    if (pendingAttachment) {
      try {
        setUploading(true);
        const fileExt = pendingAttachment.name.split(".").pop() || "bin";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("outing-image")
          .upload(fileName, pendingAttachment.file);

        let fileUrl = "";
        if (!uploadError) {
          const { data } = supabase.storage.from("outing-image").getPublicUrl(fileName);
          fileUrl = data.publicUrl;
        } else {
          console.warn("Storage upload failed, fallback to direct message text:", uploadError);
          // If storage bucket is unavailable, fallback to base64 for images
          if (pendingAttachment.type === "image") {
            fileUrl = await fileToBase64(pendingAttachment.file);
          }
        }

        if (fileUrl) {
          if (pendingAttachment.type === "image") {
            finalMessage = finalMessage
              ? `[image:${fileUrl}] ${finalMessage}`
              : `[image:${fileUrl}]`;
          } else {
            finalMessage = finalMessage
              ? `[file:${fileUrl}:${pendingAttachment.name}] ${finalMessage}`
              : `[file:${fileUrl}:${pendingAttachment.name}]`;
          }
        }
      } catch (err) {
        console.error("Error processing attachment:", err);
        toast.error("Failed to upload attachment");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!finalMessage.trim()) return;

    onSend(finalMessage);
    setText("");
    removeAttachment();
    setEmojiOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="w-full">
      {/* Pending Attachment Preview Card */}
      {pendingAttachment && (
        <div className="mb-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-2.5 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-150">
          {pendingAttachment.type === "image" ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/20 flex-shrink-0">
              <img
                src={pendingAttachment.previewUrl}
                alt="Attachment preview"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20 text-accent flex-shrink-0">
              <FileText size={24} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {pendingAttachment.name}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {formatFileSize(pendingAttachment.size)} •{" "}
              {pendingAttachment.type === "image" ? "Photo" : "Document"}
            </p>
          </div>

          <button
            type="button"
            onClick={removeAttachment}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-muted-foreground hover:bg-white/20 hover:text-foreground transition cursor-pointer"
            title="Remove attachment"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        {/* Emoji Button with Popover */}
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition cursor-pointer ${
                emojiOpen
                  ? "bg-primary/20 text-accent"
                  : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
              title="Add Emoji"
            >
              <Smile size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={12}
            className="p-0 border-0 bg-transparent shadow-none w-auto"
          >
            <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setEmojiOpen(false)} />
          </PopoverContent>
        </Popover>

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition cursor-pointer ${
            pendingAttachment
              ? "bg-primary/20 text-accent"
              : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
          }`}
          title="Attach file or photo"
        >
          <Paperclip size={20} />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={uploading}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:bg-white/10 transition"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={send}
          disabled={(!text.trim() && !pendingAttachment) || uploading}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition cursor-pointer ${
            (!text.trim() && !pendingAttachment) || uploading
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90 active:scale-95"
          }`}
          title="Send message"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
