import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser, clearSessionCookie, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Read session token from the HTTP-only cookie
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
      // Delete only the current session (not all sessions for the user)
      await prisma.session.deleteMany({
        where: { token: sessionToken },
      }).catch(() => {
        // Ignore error if session doesn't exist
      })
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    // Clear the HTTP-only session cookie
    clearSessionCookie(response)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
