import type { Message } from "../models/chat";

type Props = {
  message: Message;
};

export default function MessageBubble({
  message,
}: Props) {
  return (
    <div
      className={`flex ${
        message.isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          message.isMine
            ? "bg-primary text-primary-foreground"
            : "bg-accent"
        }`}
      >
        {!message.isMine && (
          <p className="mb-1 text-xs font-semibold">
            {message.senderName}
          </p>
        )}

        <p>{message.text}</p>

        <p className="mt-2 text-right text-[10px] opacity-70">
          {message.sentAt}
        </p>
      </div>
    </div>
  );
}