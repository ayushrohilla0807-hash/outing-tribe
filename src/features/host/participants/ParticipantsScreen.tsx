import { useMemo } from "react";
import { Route } from "@/routes/_authenticated/participants/$outingId";

import ParticipantCard from "./widgets/ParticipantCard";
import SectionHeader from "./widgets/SectionHeader";

import { getParticipants } from "./services/participantService";

export default function ParticipantsScreen() {
  const { outingId } = Route.useParams();

  const participants = getParticipants(outingId);

  const pending = useMemo(
    () => participants.filter((participant) => participant.status === "pending"),
    [participants]
  );

  const accepted = useMemo(
    () => participants.filter((participant) => participant.status === "accepted"),
    [participants]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Participants</h1>

        <p className="text-muted-foreground">
          Manage join requests and accepted participants.
        </p>
      </div>

      <section className="space-y-4">
        <SectionHeader
          title="Pending Requests"
          count={pending.length}
        />

        {pending.length === 0 ? (
          <p className="text-muted-foreground">
            No pending requests.
          </p>
        ) : (
          pending.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onAccept={(id) => console.log("Accept:", id)}
              onReject={(id) => console.log("Reject:", id)}
            />
          ))
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Accepted Participants"
          count={accepted.length}
        />

        {accepted.length === 0 ? (
          <p className="text-muted-foreground">
            No accepted participants.
          </p>
        ) : (
          accepted.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              onChat={(id) => console.log("Chat:", id)}
              onRemove={(id) => console.log("Remove:", id)}
            />
          ))
        )}
      </section>
    </div>
  );
}