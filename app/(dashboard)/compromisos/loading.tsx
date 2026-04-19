import { Skeleton } from "@/components/ui/skeleton";

export default function CompromisosLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            {[1, 2].map((j) => (
              <Skeleton key={j} className="h-24 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
