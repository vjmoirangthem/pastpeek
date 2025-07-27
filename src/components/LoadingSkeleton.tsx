import { Skeleton } from '@/components/ui/skeleton';

export const EventCardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-5 w-32" />
    </div>
    <Skeleton className="h-16 w-full rounded" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

export const LocationHeaderSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
    <Skeleton className="h-8 w-48 mx-auto" />
    <Skeleton className="h-5 w-64 mx-auto" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

export const ImageGallerySkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-32 w-full rounded-lg" />
    ))}
  </div>
);

export const SidebarSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  </div>
);