export default function Loading() {
  return (
    <div className="px-6 py-10" role="status" aria-live="polite">
      <div className="h-8 w-64 rounded bg-sunken" />
      <div className="mt-4 h-4 w-96 max-w-full rounded bg-sunken" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-lg bg-sunken" />
        <div className="h-40 rounded-lg bg-sunken" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
