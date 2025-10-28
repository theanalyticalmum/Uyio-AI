interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'stat' | 'list' | 'button'
  count?: number
  className?: string
}

export function SkeletonLoader({ variant = 'card', count = 1, className = '' }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count })

  const variants = {
    card: 'h-32 rounded-lg',
    text: 'h-4 rounded',
    stat: 'h-24 rounded-lg',
    list: 'h-16 rounded-lg',
    button: 'h-12 rounded-lg',
  }

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${variants[variant]} ${className}`}
        >
          <div className="shimmer" />
        </div>
      ))}
    </>
  )
}


