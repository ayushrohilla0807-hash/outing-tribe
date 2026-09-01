import { Users } from "lucide-react";
import type { GroupChat } from "../models/message";

type Props = {
  chat: GroupChat;
  onClick?: () => void;
};

export default function GroupChatCard({ chat, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-surface-elevated hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={
              chat.outingImage ||
              "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80"
            }
            alt={chat.outingTitle}
            className="h-14 w-14 rounded-2xl object-cover border border-white/10"
          />
          {chat.isHost && (
            <span className="absolute -bottom-1.5 -right-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-extrabold text-primary-foreground shadow border border-background">
              HOST
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`truncate text-base ${
                chat.unreadCount ? "font-bold text-foreground" : "font-semibold text-foreground"
              }`}
            >
              {chat.outingTitle}
            </h3>

            <div className="flex items-center gap-2 shrink-0">
              {chat.lastMessageTime && (
                <span className="text-xs text-muted-foreground">{chat.lastMessageTime}</span>
              )}
              {chat.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground shadow-sm">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-0.5">
            <Users className="h-3 w-3" />
            <span>
              {chat.participantCount} participant{chat.participantCount !== 1 ? "s" : ""}
            </span>
          </div>

          <p
            className={`mt-1 truncate text-sm ${
              chat.unreadCount ? "font-medium text-foreground" : "text-muted-foreground"
            }`}
          >
            {chat.lastMessageSenderName && chat.lastMessage ? (
              <span>
                <span className="font-semibold text-foreground/80">
                  {chat.lastMessageSenderName}:{" "}
                </span>
                {chat.lastMessage}
              </span>
            ) : chat.lastMessage ? (
              chat.lastMessage
            ) : (
              "Start the group conversation..."
            )}
          </p>
        </div>
      </div>
    </button>
  );
}
