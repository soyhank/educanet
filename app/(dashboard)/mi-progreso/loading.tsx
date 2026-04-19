import { Skeleton } from "@/components/ui/skeleton";

export default function MiProgresoLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <Skeleton className="h-36 rounded-2xl" />

      <Skeleton className="h-28 rounded-xl" />

      <Skeleton className="h-24 rounded-xl" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
