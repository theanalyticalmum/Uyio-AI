import Link from 'next/link'
import { Mic } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showIcon?: boolean
  href?: string
}

export function Logo({ size = 'md', showText = true, showIcon = true, href = '/' }: LogoProps) {
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


