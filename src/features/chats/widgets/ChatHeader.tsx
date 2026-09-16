import { ArrowLeft, Users, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getOptimizedImageUrl } from "@/lib/imageOptimization";

type Props = {
  title: string;
  image?: string | null;
  participants?: number;
  outingId?: string;
  onBack: () => void;
  onParticipantsClick?: () => void;
};

export default function ChatHeader({
  title,
  image,
  participants = 0,
  outingId,
  onBack,
  onParticipantsClick,
}: Props) {
  const navigate = useNavigate();
  const imgSrc = image
    ? getOptimizedImageUrl(image, "thumb")
    : "https://placehold.co/100x100?text=Outing";

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-white/10 bg-background/80 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] transition-all">
      <div className="flex items-center gap-3 px-3 sm:px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0"
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div
          onClick={onParticipantsClick}
          role={onParticipantsClick ? "button" : undefined}
          tabIndex={onParticipantsClick ? 0 : undefined}
          className={`flex items-center gap-3 min-w-0 flex-1 ${
            onParticipantsClick
              ? "cursor-pointer rounded-xl p-1 -m-1 hover:bg-white/5 active:scale-[0.99] transition select-none group"
              : ""
          }`}
          title={onParticipantsClick ? "Click to view participants" : undefined}
        >
          <div className="relative shrink-0">
            <img
              src={imgSrc}
              alt={title}
              decoding="async"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-primary/40 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base sm:text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {title}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="group-hover:text-foreground transition-colors">
                {participants} participant{participants !== 1 ? "s" : ""}
              </span>
              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="text-emerald-400 font-medium text-[11px]">Active</span>
            </div>
          </div>
        </div>

        {outingId && (
          <button
            type="button"
            onClick={() => navigate({ to: `/outing/${outingId}` })}
            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer shrink-0"
            title="View outing details"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Outing</span>
          </button>
        )}
      </div>
    </header>
  );
}
