// src/components/ui/LoadingSkeleton.tsx

interface SkeletonProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse ${className}`} />
  )
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded h-4 animate-pulse ${className}`} />
  )
}

export function SkeletonButton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg h-10 animate-pulse ${className}`} />
  )
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        
        {/* Daily Challenge */}
        <SkeletonCard className="h-48" />
        
        {/* Recent Sessions */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Practice Page Skeleton
export function PracticeSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-96" />
      </div>
    </div>
  )
}

// Feedback Page Skeleton
export function FeedbackSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <SkeletonCard className="h-32" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} className="h-40" />
          ))}
        </div>
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  )
}

// Progress Page Skeleton
export function ProgressSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
        <SkeletonCard className="h-96" />
      </div>
    </div>
  )
}

