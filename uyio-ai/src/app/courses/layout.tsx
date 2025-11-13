import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '7-Day Speaking Confidence Course | Uyio AI',
  description: 'Master confident speaking in 7 days. Join 300+ professionals on the waitlist. Free during beta.',
  openGraph: {
    title: '7-Day Speaking Confidence Course | Uyio AI',
    description: 'Master confident speaking in 7 days. Join 300+ professionals on the waitlist.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '7-Day Speaking Confidence Course | Uyio AI',
    description: 'Master confident speaking in 7 days. Join 300+ professionals on the waitlist.',
  },
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

