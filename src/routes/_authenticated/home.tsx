import { createFileRoute } from "@tanstack/react-router";
import HomeScreen from "@/features/home/HomeScreen";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomePage,
});

function HomePage() {
  return <HomeScreen />;
}
