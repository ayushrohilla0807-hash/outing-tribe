import { ArrowLeft, Users } from "lucide-react";

type Props = {
  title: string;
  participants: number;
  image: string;
  onBack: () => void;
};

export default function ChatHeader({
  title,
  participants,
  image,
  onBack,
}: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-background px-5 py-4">

      <button
        onClick={onBack}
        className="rounded-full p-2 hover:bg-accent"
      >
        <ArrowLeft size={20} />
      </button>

      <img
        src={image}
        alt={title}
        className="h-12 w-12 rounded-full object-cover"
      />

      <div className="flex-1">
        <h2 className="font-bold">
          {title}
        </h2>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users size={14} />
          {participants} members
        </div>
      </div>

      <div className="h-3 w-3 rounded-full bg-green-500" />
    </header>
  );
}