import { useSaved } from "@/features/outing/saved/context/SavedContext";

import type { UserProfile } from "../models/profile";

type Props = {
  profile: UserProfile;
};

export default function StatsSection({ profile }: Props) {
  const { savedOutings } = useSaved();

  return (
    <section className="mt-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 text-center">
          <h3 className="text-2xl font-bold text-primary">{profile.hostedCount}</h3>

          <p className="mt-1 text-sm text-muted-foreground">Hosted</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 text-center">
          <h3 className="text-2xl font-bold text-primary">{profile.joinedCount}</h3>

          <p className="mt-1 text-sm text-muted-foreground">Joined</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 text-center">
          <h3 className="text-2xl font-bold text-primary">{savedOutings.length}</h3>

          <p className="mt-1 text-sm text-muted-foreground">Saved</p>
        </div>
      </div>
    </section>
  );
}
