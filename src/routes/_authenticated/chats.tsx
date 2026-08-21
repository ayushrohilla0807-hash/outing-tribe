import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chats")({
  component: ChatsLayout,
});

function ChatsLayout() {
  return (
    <div className="flex h-full w-full flex-1 flex-col min-h-0">
      <Outlet />
    </div>
  );
}
