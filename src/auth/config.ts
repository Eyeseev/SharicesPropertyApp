/** Environment-driven auth settings shared by the Auth.js options and the proxy. */

export function parseAllowlist(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowed(email: string | null | undefined, raw = process.env.ALLOWED_EMAILS) {
  if (!email) return false
  return parseAllowlist(raw).includes(email.trim().toLowerCase())
}

/**
 * Test-only sign-in is available only outside production builds AND when AUTH_TEST_MODE=1.
 * Next.js inlines NODE_ENV at build time, so in a production build this is constant `false`.
 */
export function isTestAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.AUTH_TEST_MODE === '1'
}

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)
}

export function authSecret(): string | undefined {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET
  // Local development only. Production must set AUTH_SECRET (Auth.js refuses to run without it).
  return process.env.NODE_ENV !== 'production' ? 'local-development-only-not-a-secret' : undefined
}
