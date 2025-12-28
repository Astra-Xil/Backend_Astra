import type { MiddlewareHandler } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'

export const authMiddleware: MiddlewareHandler<{
  Variables: Variables
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createSupabaseClient(token)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  c.set('user', user)
  c.set('accessToken', token)

  await next()
}
