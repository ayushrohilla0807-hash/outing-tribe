import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/create-outing")({
  beforeLoad: () => {
    throw redirect({
      to: "/create",
      replace: true,
    });
  },
  component: () => null,
});
