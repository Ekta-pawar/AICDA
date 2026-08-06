import { Skeleton } from "@/components/ui/skeleton";

export function GallerySkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="aspect-3/4 h-55 w-full rounded-xl" />
      ))}
    </div>
  );
}
