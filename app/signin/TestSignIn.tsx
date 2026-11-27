'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

/** Local development and E2E only. Never rendered (or bundled) in production builds. */
export function TestSignIn() {
  const [email, setEmail] = useState('')
  return (
    <form
      className="signin-test"
      onSubmit={(e) => {
        e.preventDefault()
        void signIn('e2e-test-login', { email, callbackUrl: '/' })
      }}
    >
      <label htmlFor="test-email">Test sign-in (development only)</label>
      <input
        id="test-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="allowed account email"
        required
      />
      <button className="btn" type="submit">
        Test sign-in
      </button>
    </form>
  )
}
