import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

const profiles = new Hono<{
  Bindings: Env
  Variables: Variables
}>()

// ==============================
// プロフィール取得
// ==============================
profiles.get('/', async c => {
  const userId = c.req.query('user_id')

  if (!userId) {
    return c.json({ error: 'user_id is required' }, 400)
  }

  const supabase = createSupabaseClient(c.env)

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      username,
      bio,
      avatar_url,
      created_at
    `)
    .eq('id', userId)
    .single()

  if (error || !data) {
    return c.json({ error: error?.message ?? 'not found' }, 404)
  }

  return c.json(data)
})


// ==============================
// プロフィール編集
// ==============================
profiles.put('/', authMiddleware, async c => {
  const { name, username, bio, avatar_url } = await c.req.json()

  if (
    typeof name !== 'string' ||
    typeof username !== 'string' ||
    typeof bio !== 'string' ||
    typeof avatar_url !== 'string'
  ) {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  if (username.length < 3 || username.length > 20) {
    return c.json({ error: 'username length invalid' }, 400)
  }

  const user = c.get('user')
  const accessToken = c.get('accessToken')
  const supabase = createSupabaseClient(c.env, accessToken)

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name,
      username,
      bio,
      avatar_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select(`
      id,
      name,
      username,
      bio,
      avatar_url,
      updated_at
    `)
    .single()

  if (error || !data) {
    return c.json({ error: error?.message ?? 'update failed' }, 500)
  }

  return c.json(data)
})

export default profiles
