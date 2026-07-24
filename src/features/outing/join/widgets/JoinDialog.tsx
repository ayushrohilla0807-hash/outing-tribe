import { useState } from "react";

import type { ExploreOuting } from "@/features/explore/models/outing";

import { sendJoinRequest } from "../services/joinService";

type JoinDialogOuting = {
    id: string;
    title: string;
    location: string;
    host: string;
    participants: number;
  };
  
  type Props = {
    outing: JoinDialogOuting;
    onClose: () => void;
    onConfirm: () => void;
  };

  export default function JoinDialog({
    outing,
    onClose,
    onConfirm,
  }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
  
    onConfirm();
  
    setLoading(false);
  
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-xl">

        <h2 className="text-2xl font-bold">
          Join Outing
        </h2>

        <p className="mt-2 text-muted-foreground">
          You're about to send a join request.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl border p-4">

          <h3 className="font-semibold">
            {outing.title}
          </h3>

          <p className="text-sm text-muted-foreground">
            📍 {outing.location}
          </p>

          <p className="text-sm text-muted-foreground">
            👤 Hosted by {outing.host}
          </p>

          <p className="text-sm text-muted-foreground">
            👥 Needs {outing.participants} people
          </p>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="rounded-xl bg-primary px-5 py-2 text-white"
          >
            {loading
              ? "Sending..."
              : "Send Request"}
          </button>

        </div>

      </div>

    </div>
  );
}