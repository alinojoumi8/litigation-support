export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <div className="h-9 w-72 max-w-full rounded bg-sunken" />
      <div className="mt-3 h-4 w-[28rem] max-w-full rounded bg-sunken" />
      <div className="mt-10 space-y-3">
        <div className="h-16 rounded-lg bg-sunken" />
        <div className="h-16 rounded-lg bg-sunken" />
        <div className="h-16 rounded-lg bg-sunken" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
