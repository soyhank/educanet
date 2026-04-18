import { cn } from "@/lib/utils";

export function EducanetLogo({
  variant = "full",
  className,
}: {
  variant?: "full" | "icon";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <path
          d="M8 22V14a8 8 0 0 1 16 0v8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="13" r="2.5" fill="white" />
        <path
          d="M12 22h8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {variant === "full" && (
        <span className="text-lg font-bold tracking-tight">educanet</span>
      )}
    </div>
  );
}
