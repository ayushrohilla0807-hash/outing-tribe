import { useState } from "react";

import OutingCard from "@/components/cards/OutingCard";
import JoinDialog from "@/features/outing/join/widgets/JoinDialog";
import { useJoinRequest } from "@/features/outing/join/hooks/useJoinRequest";

import { mockOutings } from "../data/mockOutings";

export default function RecommendedSection() {
  const {
    getStatus,
    sendRequest,
    cancelRequest,
  } = useJoinRequest();

  const [selectedOuting, setSelectedOuting] =
    useState<(typeof mockOutings)[0] | null>(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          ⭐ Recommended For You
        </h2>

        <button className="text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="space-y-8">
        {mockOutings.map((outing) => (
          <OutingCard
            key={outing.id}
            id={outing.id} 
            image={outing.coverImage}
            title={outing.title}
            category="Coffee"
            location={outing.location}
            date={`${outing.date} • ${outing.time}`}
            host={outing.organizer.name}
            hostAvatar={outing.organizer.avatar}
            rating={outing.organizer.rating}
            joined={outing.joined}
            capacity={outing.capacity}
            status={getStatus(outing.id)}
            onJoin={() => {
              setSelectedOuting(outing);
              setDialogOpen(true);
            }}
            onCancel={() => {
              cancelRequest(outing.id);
            }}
            onOpenChat={() => {
              window.location.href = `/chats/${outing.id}`;
            }}
          />
        ))}
      </div>

      {dialogOpen && selectedOuting && (
        <JoinDialog
          outing={{
            id: selectedOuting.id,
            title: selectedOuting.title,
            location: selectedOuting.location,
            host: selectedOuting.organizer.name,
            participants: selectedOuting.joined,
          }}
          onClose={() => setDialogOpen(false)}
          onConfirm={() => {
            sendRequest(selectedOuting.id);
          }}
        />
      )}
    </section>
  );
}