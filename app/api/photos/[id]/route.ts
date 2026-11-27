import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth/options'
import { isAllowed } from '@/auth/config'
import { storedPhotoFile } from '@/data/loader'

export const dynamic = 'force-dynamic'

const TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

/** Serves a stored photo to an allowlisted session only. The id is looked up in the photo records. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !isAllowed(session.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { id } = await ctx.params
  const photo = storedPhotoFile(id)
  if (!photo) return NextResponse.json({ error: 'not found' }, { status: 404 })
  // Statically scoped to research/photos so the deployment bundles only the photos.
  const dir = path.join(process.cwd(), 'research', 'photos')
  const abs = path.join(dir, photo.file.replace(/^research\/photos\//, ''))
  if (!abs.startsWith(dir + path.sep)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }
  const type = TYPES[path.extname(abs).toLowerCase()]
  if (!type) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const bytes = await readFile(abs)
  return new NextResponse(new Uint8Array(bytes), {
    headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store' },
  })
}
