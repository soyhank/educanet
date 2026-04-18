import { Skeleton } from "@/components/ui/skeleton";

export default function CursoDetalleLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Hero */}
      <div className="rounded-xl bg-muted/30 p-6 sm:p-10 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-5 w-80" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="space-y-4 rounded-xl border p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
