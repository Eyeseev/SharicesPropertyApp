import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth/options'
import { isAllowed } from '@/auth/config'
import { Explorer } from '@/ui/Explorer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session || !isAllowed(session.user?.email)) redirect('/signin')
  return <Explorer />
}
