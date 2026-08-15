import { Users, MessageSquare } from "lucide-react";
import type { Chat } from "../models/message";

type Props = {
  chat: Chat;
  onClick?: () => void;
};

export default function ChatCard({ chat, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-surface-elevated hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={
              chat.otherUserAvatar ||
              chat.outingImage ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
            }
            alt={chat.otherUserName || chat.outingName}
            className="h-14 w-14 rounded-2xl object-cover border border-white/10"
          />
          {chat.otherUserAvatar && chat.outingImage && (
            <img
              src={chat.outingImage}
              alt=""
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-md object-cover border border-background shadow"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">
              {chat.otherUserName ? `${chat.otherUserName}` : chat.outingName}
            </h3>

            {chat.lastMessageTime && (
              <span className="shrink-0 text-xs text-muted-foreground">{chat.lastMessageTime}</span>
            )}
          </div>

          <p className="text-xs text-primary font-medium truncate mt-0.5">{chat.outingName}</p>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {chat.lastMessage || "Start chatting..."}
          </p>
        </div>
      </div>
    </button>
  );
}
