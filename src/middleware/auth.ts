import type { MiddlewareHandler } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Env
  Variables: Variables
}> = async (c, next) => {
    console.log('METHOD:', c.req.method)
console.log('AUTH HEADER:', c.req.header('authorization'))
console.log('RAW HEADERS:', [...c.req.raw.headers.entries()])
  // ✅ preflight は必ず通す
  if (c.req.method === 'OPTIONS') {
    return await next()
  }

  // ✅ 小文字で取得
  const authHeader = c.req.header('authorization')
  if (!authHeader) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  // ✅ Bearer 付きのまま Supabase に渡す（Next.js と同じ）
  const supabase = createSupabaseClient(c.env, authHeader)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  // UI 用に raw token が必要なら分離
  const accessToken = authHeader.replace(/^Bearer\s+/i, '')

  c.set('accessToken', accessToken)
  c.set('user', user)

  await next()
}
