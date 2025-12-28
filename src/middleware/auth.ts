import type { MiddlewareHandler } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env        // ★これを追加
  Variables: Variables
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createSupabaseClient(c.env, token)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  c.set('accessToken', token)
  c.set('user', user)

  await next()
}
