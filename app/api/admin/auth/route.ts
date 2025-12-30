import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      // Create a simple session token (in production, use a more secure method)
      const sessionToken = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
      
      // Set cookie that expires in 24 hours
      const cookieStore = await cookies()
      cookieStore.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Check if user is authenticated
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')

  if (session) {
    return NextResponse.json({ authenticated: true })
  } else {
    return NextResponse.json({ authenticated: false })
  }
}

