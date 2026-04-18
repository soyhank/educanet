import { Skeleton } from "@/components/ui/skeleton";

export default function LeccionLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar skeleton */}
      <aside className="hidden w-72 shrink-0 border-r bg-card p-4 lg:block">
        <Skeleton className="h-5 w-40 mb-3" />
        <Skeleton className="h-1.5 w-full mb-1" />
        <Skeleton className="h-3 w-24 mb-6" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full mb-1" />
        ))}
      </aside>

      {/* Main skeleton */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </div>
      </div>

      {/* Right panel skeleton */}
      <aside className="hidden w-80 shrink-0 border-l bg-card p-4 lg:block">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-14" />
        </div>
        <Skeleton className="h-20 w-full mb-2" />
        <Skeleton className="h-8 w-24" />
      </aside>
    </div>
  );
}
