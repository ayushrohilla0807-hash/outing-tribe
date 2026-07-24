import { MessageCircle } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">

      <MessageCircle
        className="mb-4 h-12 w-12 text-muted-foreground"
      />

      <h2 className="text-xl font-bold">
        No Chats Yet
      </h2>

      <p className="mt-2 max-w-xs text-center text-muted-foreground">
        Join an outing and get accepted to unlock group chats.
      </p>

    </div>
  );
}