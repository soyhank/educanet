import { Skeleton } from "@/components/ui/skeleton";

export default function MiCarreraLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      <div className="rounded-xl border p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
