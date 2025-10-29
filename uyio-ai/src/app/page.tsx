import { GuestHero } from '@/components/home/GuestHero'

// Homepage is always the guest landing page
// Authenticated users are redirected to /dashboard
export default function HomePage() {
  return <GuestHero />
}
