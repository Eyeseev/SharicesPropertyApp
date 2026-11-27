import type { NextAuthOptions } from 'next-auth'
import type { Provider } from 'next-auth/providers/index'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authSecret, isAllowed, isGoogleConfigured, isTestAuthEnabled } from './config'

export const TEST_PROVIDER_ID = 'e2e-test-login'

export function buildProviders(): Provider[] {
  const providers: Provider[] = []
  if (isGoogleConfigured()) {
    providers.push(
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      }),
    )
  }
  if (process.env.NODE_ENV !== 'production' && isTestAuthEnabled()) {
    providers.push(
      CredentialsProvider({
        id: TEST_PROVIDER_ID,
        name: 'Test sign-in (development only)',
        credentials: { email: { label: 'Email', type: 'email' } },
        async authorize(credentials) {
          const email = credentials?.email?.trim().toLowerCase()
          return email ? { id: email, email, name: email } : null
        },
      }),
    )
  }
  return providers
}

export function buildAuthOptions(): NextAuthOptions {
  return {
    secret: authSecret(),
    session: { strategy: 'jwt' },
    providers: buildProviders(),
    pages: { signIn: '/signin', error: '/signin' },
    callbacks: {
      // Only the allowlisted accounts may sign in, whichever provider is used.
      async signIn({ user }) {
        return isAllowed(user.email)
      },
    },
  }
}

export const authOptions = buildAuthOptions()
