import { createFileRoute } from "@tanstack/react-router";
import ProfileScreen from "@/features/profile/ProfileScreen";

export const Route = createFileRoute("/_authenticated/profile/$userId")({
  component: ProfileUserIdRoute,
});

function ProfileUserIdRoute() {
  const { userId } = Route.useParams();
  return <ProfileScreen targetUserId={userId} />;
}
