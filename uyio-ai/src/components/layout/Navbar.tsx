'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { AuthButton } from './AuthButton'
import { Badge } from '../common/Badge'
import { TrendingUp, BookOpen } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const navLinks = [
    { href: '/practice', label: 'Practice', icon: null },
    { href: '/progress', label: 'Progress', icon: TrendingUp },
    { href: '/courses', label: 'Courses', icon: BookOpen },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 transition-all duration-200 ${
        scrolled ? 'shadow-md' : 'border-b border-gray-200 dark:border-gray-800'
      }`}
      style={{ height: 'var(--nav-height)' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Center Navigation - Desktop Only */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </nav>
    </header>
  )
}


