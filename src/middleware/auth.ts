import type { MiddlewareHandler } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: Variables
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  // 🔥 Bearer 付きのまま渡す
  const supabase = createSupabaseClient(c.env, authHeader)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // INSERT 用に raw token が欲しければ分けて保持
  const accessToken = authHeader.replace('Bearer ', '')

  c.set('accessToken', accessToken)
  c.set('user', user)

  await next()
}
