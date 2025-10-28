import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware to handle Supabase auth token refresh
 * Runs on every request to keep sessions valid
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Configure which routes the middleware should run on
 * Currently runs on all routes except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}


