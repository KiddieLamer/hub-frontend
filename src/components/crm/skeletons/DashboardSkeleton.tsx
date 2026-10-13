import { Skeleton } from '../Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
      {/* COLUMN 1 SKELETON */}
      <div className="space-y-4">
        {/* Contact Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-3">
            <div>
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div>
              <Skeleton className="h-3 w-24 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div>
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Social Media Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        </div>

        {/* Company Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-3 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Map Location Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-3 shadow-xs">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>

      {/* COLUMN 2 SKELETON */}
      <div className="space-y-4">
        {/* Up Next Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        </div>

        {/* Activity Log Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>

      {/* COLUMN 3 SKELETON */}
      <div className="space-y-4">
        {/* Lead Score Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Warranty Card Skeleton */}
        <div className="bg-white/80 rounded-3xl p-5 border border-white/80 space-y-4 shadow-xs">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
