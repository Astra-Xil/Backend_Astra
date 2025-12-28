import type { User } from '@supabase/supabase-js'

export type Variables = {
  accessToken: string
  user: User
}
