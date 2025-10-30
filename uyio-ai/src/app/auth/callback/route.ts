import { createActionClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Detect if request is from mobile/in-app browser
function isMobileOrInAppBrowser(userAgent: string): boolean {
  const mobileRegex = /iPhone|iPad|iPod|Android/i
  const inAppBrowserRegex = /FBAN|FBAV|Instagram|Line|Twitter|WhatsApp|LinkedIn|YahooMail/i
  
  return mobileRegex.test(userAgent) || inAppBrowserRegex.test(userAgent)
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const userAgent = request.headers.get('user-agent') || ''
  const isMobile = isMobileOrInAppBrowser(userAgent)

  if (code) {
    const supabase = await createActionClient()
    
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=invalid_token`)
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && sessionData.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // Determine redirect destination
      let redirectPath = '/dashboard'
      if (!profile) {
        redirectPath = '/auth/onboarding'
      } else if (!profile.onboarding_completed) {
        redirectPath = '/auth/onboarding'
      }

      // For mobile/in-app browsers, pass session via URL to client-side completion
      if (isMobile) {
        const tokens = encodeURIComponent(JSON.stringify({
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        }))
        
        return NextResponse.redirect(
          `${origin}/auth/complete?tokens=${tokens}&redirect=${redirectPath}`
        )
      }

      // For desktop, direct redirect (standard flow)
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`)
}


