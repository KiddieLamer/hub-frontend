import { Skeleton } from '../Skeleton'

export function SidebarSkeleton() {
  return (
    <div className="space-y-3 mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white/60 rounded-2xl p-3.5 border border-white/60 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
