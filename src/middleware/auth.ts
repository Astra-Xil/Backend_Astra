import type { MiddlewareHandler } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: Variables
}> = async (c, next) => {
  if (c.req.method === 'OPTIONS') return next()

  const authHeader = c.req.header('authorization')
  if (!authHeader) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')

  try {
    const supabase = createSupabaseClient(c.env)
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const { id } = data.user
    c.set('user', { id })
    c.set('accessToken', token)


    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
