import { Skeleton, SkeletonStatCards } from "@/components/motion/Skeleton";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="hidden w-60 shrink-0 border-r border-border bg-sidebar p-4 lg:block">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="bg-page-backdrop flex-1 p-6">
        <Skeleton className="h-7 w-48" />
        <div className="mt-6">
          <SkeletonStatCards count={3} />
        </div>
      </div>
    </div>
  );
}
