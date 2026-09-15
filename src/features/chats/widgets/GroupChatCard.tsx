import { Users, Crown } from "lucide-react";
import type { GroupChat } from "../models/message";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

type Props = {
  chat: GroupChat;
  onClick?: () => void;
};

export default function GroupChatCard({ chat, onClick }: Props) {
  const hasUnread = chat.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
        hasUnread
          ? "border-primary/35 bg-surface/90 shadow-md ring-1 ring-primary/20"
          : "border-white/10 bg-card/60 hover:bg-card hover:border-white/20 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3.5">
        {/* Outing Cover Avatar */}
        <div className="relative shrink-0">
          <div
            className={`rounded-2xl p-[2px] transition-all duration-200 ${
              hasUnread
                ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-primary"
                : "bg-white/10 group-hover:bg-white/20"
            }`}
          >
            <img
              src={
                chat.outingImage
                  ? getOptimizedImageUrl(chat.outingImage, "thumb")
                  : "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80"
              }
              alt={chat.outingTitle}
              loading="lazy"
              decoding="async"
              className="h-13 w-13 sm:h-14 sm:w-14 rounded-[14px] object-cover"
            />
          </div>

          {/* Host Tag */}
          {chat.isHost && (
            <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-amber-500/90 text-amber-950 font-black px-1.5 py-0.2 text-[8.5px] uppercase tracking-wider shadow-sm border border-background">
              <Crown className="h-2 w-2 fill-amber-950" /> Host
            </span>
          )}
        </div>

        {/* Info & Message Preview */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Top Line: Title + Time */}
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`truncate text-sm sm:text-base tracking-tight ${
                hasUnread
                  ? "font-bold text-foreground"
                  : "font-semibold text-foreground/90 group-hover:text-foreground"
              }`}
            >
              {chat.outingTitle}
            </h3>

            <span
              className={`shrink-0 text-[11px] font-medium transition-colors ${
                hasUnread ? "text-primary font-bold" : "text-muted-foreground/70"
              }`}
            >
              {chat.lastMessageTime || "New"}
            </span>
          </div>

          {/* Second Line: Participant count & Last Message */}
          <div className="flex items-center justify-between gap-2">
            <p
              className={`truncate text-xs sm:text-sm leading-relaxed ${
                hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {chat.lastMessageSenderName && chat.lastMessage ? (
                <span>
                  <span
                    className={
                      chat.lastMessageSenderName === "You"
                        ? "text-muted-foreground font-semibold"
                        : "text-amber-400 font-semibold"
                    }
                  >
                    {chat.lastMessageSenderName}:{" "}
                  </span>
                  <span>{chat.lastMessage}</span>
                </span>
              ) : chat.lastMessage ? (
                <span>{chat.lastMessage}</span>
              ) : (
                <span className="italic text-muted-foreground/60">Start planning the outing!</span>
              )}
            </p>

            {/* Unread Badge / Participant pill */}
            <div className="flex items-center gap-1.5 shrink-0">
              {hasUnread ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-black text-primary-foreground shadow-glow animate-pulse">
                  {chat.unreadCount}
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Users className="h-3 w-3" />
                  {chat.participantCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
