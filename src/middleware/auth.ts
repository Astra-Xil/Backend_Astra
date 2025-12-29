import type { MiddlewareHandler } from 'hono'
import { verifySupabaseJWT } from '../lib/verifySupabaseJWT'
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
    const payload = await verifySupabaseJWT(token)

    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // ✅ id だけで十分
    c.set('user', { id: payload.sub })
    c.set('accessToken', token)

    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
