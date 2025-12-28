import { createClient } from '@supabase/supabase-js'

type Env = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function createSupabaseClient(
  env: Env,
  authHeader?: string
) {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader
          ? { Authorization: authHeader }
          : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
