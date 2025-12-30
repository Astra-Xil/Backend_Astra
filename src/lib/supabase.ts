import { createClient } from '@supabase/supabase-js'
import type { Env } from '../types/env'

export const SUPABASE_AUTH_COOKIE = 'sb-auth-token'

export function createSupabaseClient(
  env: Env,
  authHeader?: string
) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    authHeader
      ? {
          global: {
            headers: {
              Authorization: authHeader.startsWith('Bearer ')
                ? authHeader
                : `Bearer ${authHeader}`,
            },
          },
        }
      : {}
  )
}
