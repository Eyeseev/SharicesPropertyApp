import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth/options'
import { isAllowed } from '@/auth/config'
import { loadPropertyData } from '@/data/loader'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isAllowed(session.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json(loadPropertyData(), {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
