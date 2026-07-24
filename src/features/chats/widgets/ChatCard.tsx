import { Users } from "lucide-react";
import type { Chat } from "../models/chat";

type Props = {
  chat: Chat;
  onClick?: () => void;
};

export default function ChatCard({
  chat,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border bg-card p-4 text-left transition hover:bg-accent"
    >
      <div className="flex items-start gap-4">
        <img
          src={chat.outingImage}
          alt={chat.outingName}
          className="h-16 w-16 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="truncate text-lg font-semibold">
              {chat.outingName}
            </h3>

            <span className="text-xs text-muted-foreground">
              {chat.lastMessageTime}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {chat.lastMessage}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              {chat.participants} participants
            </div>

            {chat.unreadCount > 0 && (
              <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                {chat.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}