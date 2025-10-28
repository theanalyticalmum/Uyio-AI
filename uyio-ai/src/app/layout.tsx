import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { MobileNav } from '@/components/layout/MobileNav'
import { BottomNav } from '@/components/layout/BottomNav'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Uyio AI - Master Communication in 90 Seconds',
  description:
    'Your AI communication coach. Build clear, confident communication skills with personalized feedback and practice sessions.',
  keywords: ['communication', 'public speaking', 'AI coach', 'practice', 'confidence', 'clarity'],
  authors: [{ name: 'Uyio AI' }],
  creator: 'Uyio AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://uyio.ai',
    title: 'Uyio AI - Master Communication',
    description: 'Your AI communication coach. Practice and improve in just 90 seconds.',
    siteName: 'Uyio AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uyio AI - Master Communication',
    description: 'Your AI communication coach. Practice and improve in just 90 seconds.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Navbar />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Main Content */}
        <main className="min-h-screen pt-16 md:pt-16 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>

        {/* Toast Notifications */}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
