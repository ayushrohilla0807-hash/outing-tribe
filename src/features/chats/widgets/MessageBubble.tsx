import type { Message } from "../models/message";

type Props = {
  message: Message;
};

export default function MessageBubble({ message }: Props) {
  return (
    <div className={`mb-4 flex ${message.isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          message.isMine
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border bg-card"
        }`}
      >
        <p className="break-words text-sm leading-6">{message.message}</p>

        <div
          className={`mt-2 text-right text-[11px] ${
            message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
