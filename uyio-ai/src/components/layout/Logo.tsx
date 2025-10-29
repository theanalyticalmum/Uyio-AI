'use client'

import Link from 'next/link'
import { Mic } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showIcon?: boolean
}

export function Logo({ size = 'md', showText = true, showIcon = true }: LogoProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [href, setHref] = useState('/')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setHref(user ? '/dashboard' : '/')
    }
    checkAuth()
  }, [])

  const sizeClasses = {
    sm: { text: 'text-lg', icon: 'w-4 h-4' },
    md: { text: 'text-xl', icon: 'w-5 h-5' },
    lg: { text: 'text-2xl', icon: 'w-6 h-6' },
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
    >
      {showIcon && <Mic className={`${sizeClasses[size].icon} text-blue-500`} />}
      {showText && <span className={sizeClasses[size].text}>Uyio AI</span>}
    </Link>
  )
}


