import { cn } from "@/lib/utils";

export function NivelBadge({
  nivel,
  size = "default",
  className,
}: {
  nivel: number;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-6 w-6 text-xs",
    default: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-lg",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary/10 font-bold text-primary ring-2 ring-primary/20",
        sizes[size],
        className
      )}
    >
      {nivel}
    </div>
  );
}
