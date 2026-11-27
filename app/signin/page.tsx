import { isGoogleConfigured, isTestAuthEnabled } from '@/auth/config'
import { SignInForm } from './SignInForm'

export const dynamic = 'force-dynamic'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return (
    <main className="signin">
      <div className="signin-card">
        <h1>Private Property Explorer</h1>
        <p className="signin-sub">Private. Sign in with an approved account.</p>
        {error && (
          <p className="signin-error" role="alert">
            {error === 'AccessDenied'
              ? 'This account is not on the access list.'
              : 'Sign-in failed. Please try again.'}
          </p>
        )}
        <SignInForm google={isGoogleConfigured()} testMode={isTestAuthEnabled()} />
      </div>
    </main>
  )
}
