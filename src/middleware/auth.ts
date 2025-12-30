import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { createSupabaseClient, SUPABASE_AUTH_COOKIE } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: Variables
}> = async (c, next) => {
  if (c.req.method === 'OPTIONS') return next()

  const authHeader = c.req.header('authorization')
  const sessionCookie = getCookie(c, SUPABASE_AUTH_COOKIE)
  const token =
    authHeader?.replace(/^Bearer\s+/i, '') ??
    (() => {
      if (!sessionCookie) return null
      try {
        const session = JSON.parse(sessionCookie) as { access_token?: string }
        return session.access_token ?? null
      } catch {
        return null
      }
    })()

  if (!token) return c.json({ error: 'Not authenticated' }, 401)

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
