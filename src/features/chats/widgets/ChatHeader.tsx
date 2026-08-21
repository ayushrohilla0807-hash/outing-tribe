import { ArrowLeft, Users } from "lucide-react";

type Props = {
  title: string;
  image?: string | null;
  participants?: number;
  onBack: () => void;
};

export default function ChatHeader({ title, image, participants = 0, onBack }: Props) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-white/10 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center gap-3.5 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 text-foreground hover:bg-white/10 active:scale-95 transition cursor-pointer"
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <img
          src={image ?? "https://placehold.co/100x100?text=Outing"}
          alt={title}
          className="h-11 w-11 rounded-full object-cover border border-white/15"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base sm:text-lg font-bold text-foreground">{title}</h2>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>
              {participants} participant
              {participants !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
