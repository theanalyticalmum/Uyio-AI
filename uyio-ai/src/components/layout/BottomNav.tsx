'use client'

import { usePathname } from 'next/navigation'
import { Mic, TrendingUp, BookOpen } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const navItems = [
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/practice', label: 'Practice', icon: Mic, center: true },
    { href: '/courses', label: 'Courses', icon: BookOpen },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-40"
      style={{ height: 'var(--bottom-nav-height)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isOnTargetPage = pathname === item.href

          if (item.center) {
            // Microphone button with smart behavior
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isOnTargetPage) {
                    // Already on practice page - trigger recording instead of navigating
                    e.preventDefault()
                    window.dispatchEvent(new CustomEvent('trigger-recording'))
                  }
                  // If not on practice page, let href navigate naturally
                }}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    active
                      ? 'bg-blue-500 text-white shadow-lg scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.label}
                </span>
              </a>
            )
          }

          // Regular nav items
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}


