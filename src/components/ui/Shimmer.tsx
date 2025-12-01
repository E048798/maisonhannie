import { cn } from "@/lib/utils";

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gradient-to-r from-[#F7F3EC] via-[#E5DCC5] to-[#F7F3EC] bg-[length:200%_100%]", className)} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <Shimmer className="h-64 w-full" />
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-3/4 rounded" />
        <Shimmer className="h-3 w-1/2 rounded" />
        <Shimmer className="h-6 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-[70vh] relative">
      <Shimmer className="absolute inset-0" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <Shimmer className="h-48 w-full" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-5 w-full rounded" />
        <Shimmer className="h-3 w-full rounded" />
        <Shimmer className="h-3 w-2/3 rounded" />
        <div className="flex gap-4 pt-2">
          <Shimmer className="h-4 w-16 rounded" />
          <Shimmer className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}