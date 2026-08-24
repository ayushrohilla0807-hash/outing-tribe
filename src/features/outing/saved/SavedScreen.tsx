import { useSaved } from "./context/SavedContext";
import SavedOutingCard from "./widgets/SavedOutingCard";

export default function SavedScreen() {
  const { savedOutings } = useSaved();

  return (
    <main className="mx-auto max-w-xl px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-8">
      <h1 className="mb-6 text-3xl font-bold">❤️ Saved Outings</h1>

      {savedOutings.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-lg font-semibold">No Saved Outings</p>

          <p className="mt-2 text-muted-foreground">
            Save your favourite outings and they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {savedOutings.map((outing) => (
            <SavedOutingCard key={outing.id} outing={outing} />
          ))}
        </div>
      )}
    </main>
  );
}
