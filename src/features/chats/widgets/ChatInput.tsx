import { Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";

type Props = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;

    onSend(text);

    setText("");
  }

  return (
    <div className="sticky bottom-0 border-t bg-background p-4">
      <div className="flex items-center gap-2">
        <button>
          <Smile size={20} />
        </button>

        <button>
          <Paperclip size={20} />
        </button>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border px-4 py-3 outline-none"
        />

        <button onClick={send} className="rounded-full bg-primary p-3 text-white">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
