import { ArrowLeft, Users } from "lucide-react";

type Props = {
  title: string;
  image?: string | null;
  participants?: number;
  onBack: () => void;
};

export default function ChatHeader({ title, image, participants = 0, onBack }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="flex items-center gap-4 px-4 py-3">
        <button onClick={onBack} className="rounded-full p-2 transition hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <img
          src={image ?? "https://placehold.co/100x100?text=Outing"}
          alt={title}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{title}</h2>

          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
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
