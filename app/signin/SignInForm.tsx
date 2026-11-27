'use client'

import { signIn } from 'next-auth/react'
import { TestSignIn } from './TestSignIn'

export function SignInForm({ google, testMode }: { google: boolean; testMode: boolean }) {
  return (
    <div className="signin-actions">
      {google && (
        <button className="btn btn-primary" onClick={() => signIn('google', { callbackUrl: '/' })}>
          Sign in with Google
        </button>
      )}
      {!google && !testMode && (
        <p className="signin-note">
          Google sign-in is not configured yet. See docs/PHASE_0.1_REPORT.md for setup.
        </p>
      )}
      {/* Compiled out of production builds (NODE_ENV is inlined at build time). */}
      {process.env.NODE_ENV !== 'production' && testMode && <TestSignIn />}
    </div>
  )
}
