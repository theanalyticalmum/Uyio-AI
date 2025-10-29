import { createActionClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createActionClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=invalid_token`)
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // If no profile exists, redirect to complete onboarding
      if (!profile) {
        return NextResponse.redirect(`${origin}/auth/onboarding`)
      }

      // If onboarding is complete, go to homepage (which shows UserDashboard)
      if (profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/`)
      }

      // Otherwise, complete onboarding
      return NextResponse.redirect(`${origin}/auth/onboarding`)
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}


