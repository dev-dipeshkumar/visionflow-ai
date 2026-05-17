import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Validate the session from the HTTP-only cookie
    const authUser = await getAuthUser(request)

    if (!authUser) {
      return NextResponse.json(
        { valid: false, error: 'Session expired or invalid' },
        { status: 401 }
      )
    }

    // Return the authenticated user data (derived from verified session)
    return NextResponse.json({
      valid: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        avatarUrl: authUser.avatarUrl,
        role: authUser.role,
        isTester: authUser.isTester,
        department: authUser.department,
        tenantId: authUser.tenantId,
        isActive: authUser.isActive,
        subscriptionStatus: authUser.subscriptionStatus,
        trialEndsAt: authUser.trialEndsAt?.toISOString() ?? null,
        emailVerified: authUser.emailVerified,
        onboardingStatus: authUser.onboardingStatus,
        // Derived from tenant
        plan: authUser.plan,
        workspace: authUser.workspace,
        tenantSubscriptionStatus: authUser.tenantSubscriptionStatus,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
