import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-primary/10", className)} {...props}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-linear-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export { Skeleton };
