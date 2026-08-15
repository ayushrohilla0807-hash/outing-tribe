import { useEffect, useMemo, useState } from "react";

import type { HistoryOuting } from "./models/history";
import { getHistory } from "./services/historyService";

import EmptyHistory from "./widgets/EmptyHistory";
import HistoryCard from "./widgets/HistoryCard";

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  joined: 1,
  completed: 2,
  cancelled: 3,
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryOuting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await getHistory();
        setHistory(data);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [history]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-8 pb-32">
        <h1 className="mb-8 text-4xl font-bold">History</h1>

        <div className="flex justify-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 pb-32">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">History</h1>

        <p className="mt-2 text-muted-foreground">View your joined and hosted outings.</p>
      </div>

      {sortedHistory.length === 0 ? (
        <EmptyHistory />
      ) : (
        <div className="space-y-6">
          {sortedHistory.map((outing) => (
            <HistoryCard key={outing.id} outing={outing} />
          ))}
        </div>
      )}
    </main>
  );
}
