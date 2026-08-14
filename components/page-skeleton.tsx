export default function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-5 w-40 bg-[var(--surface-3)] rounded-md" />
        <div className="h-3.5 w-64 bg-[var(--surface-3)] rounded-md" />
      </div>
      <div className="h-28 bg-[var(--surface-3)] rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-20 bg-[var(--surface-3)] rounded-lg" />
        <div className="h-20 bg-[var(--surface-3)] rounded-lg" />
        <div className="h-20 bg-[var(--surface-3)] rounded-lg" />
      </div>
    </div>
  );
}
