import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { createSupabaseClient } from '../lib/supabase'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'

const threads = new Hono<{
  Bindings: Env
  Variables: Variables
}>()

// =====================
// スレ作成
// =====================
threads.post('/', authMiddleware, async c => {
  const { anime_id, title } = await c.req.json()

  if (
    typeof anime_id !== 'number' ||
    typeof title !== 'string' ||
    title.length === 0 ||
    title.length > 100
  ) {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  const user = c.get('user')
  const accessToken = c.get('accessToken')
  const supabase = createSupabaseClient(c.env, accessToken)

  const { data, error } = await supabase
    .from('threads')
    .insert({
      anime_id,
      title,
      created_by: user.id,
    })
    .select(`
      id,
      anime_id,
      title,
      created_at,
      updated_at,
      profiles (
        id,
        name,
        avatar_url
      )
    `)
    .single()

  if (error || !data) {
    return c.json({ error: error?.message ?? 'insert failed' }, 500)
  }

  return c.json(data)
})


// =====================
// スレ一覧取得
// =====================
threads.get('/', async c => {
  const animeIdRaw = c.req.query('anime_id')

  if (!animeIdRaw) {
    return c.json({ error: 'anime_id is required' }, 400)
  }

  const animeId = Number(animeIdRaw)
  if (Number.isNaN(animeId)) {
    return c.json({ error: 'anime_id must be a number' }, 400)
  }

  const supabase = createSupabaseClient(c.env)

  const { data, error } = await supabase
    .from('threads')
    .select(`
      id,
      anime_id,
      title,
      created_at,
      updated_at,
      profiles (
        id,
        name,
        avatar_url
      )
    `)
    .eq('anime_id', animeId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

export default threads
