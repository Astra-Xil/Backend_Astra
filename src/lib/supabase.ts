import { createClient } from '@supabase/supabase-js'
import type { Env } from '../types/env'

export function createSupabaseClient(
  env: Env,
  accessToken?: string
) {
  const authHeader = accessToken
    ? accessToken.startsWith('Bearer ')
      ? accessToken
      : `Bearer ${accessToken}`
    : undefined

  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    authHeader
      ? {
          global: {
            headers: {
              Authorization: authHeader,
            },
          },
        }
      : {}
  )
}
