export default function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="text-6xl">📭</div>

      <h2 className="mt-4 text-2xl font-semibold">No History Yet</h2>

      <p className="mt-2 max-w-sm text-muted-foreground">
        Join or host an outing to see your activity history here.
      </p>
    </div>
  );
}
