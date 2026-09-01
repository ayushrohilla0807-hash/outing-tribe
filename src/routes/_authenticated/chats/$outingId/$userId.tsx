import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats/$outingId/$userId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/chats/$outingId/group",
      params: { outingId: params.outingId },
      replace: true,
    });
  },
  component: () => null,
});
