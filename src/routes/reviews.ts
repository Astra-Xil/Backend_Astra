import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { createSupabaseClient } from '../lib/supabase'
import { validateText } from '../lib/validateText'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'
const reviews = new Hono<{
  Bindings: Env
  Variables: Variables
}>()

reviews.post('/', authMiddleware, async c => {
  const body = await c.req.json()
  const { anime_id, score, comment } = body
  if (!anime_id || typeof comment !== 'string' || typeof score !== 'number') {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  const user = c.get('user')
  const accessToken = c.get('accessToken')
  const supabase = createSupabaseClient(c.env, accessToken)



  const ok = await validateText(comment, {
    enablePerspective: true,
    perspectiveTimeoutMs: 3000,
  })

  if (!ok) {
    return c.json({ error: '不適切な表現が含まれています。' }, 400)
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      anime_id,
      score,
      comment,
      user_id: user.id,
    })
    .select()

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})



reviews.get('/', async c => {
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
    .from('reviews')
    .select(`
      id,
      score,
      comment,
      created_at,
      user_id,
      profiles (
        name,
        avatar_url
      )
    `)
    .eq('anime_id', animeId)
    .order('created_at', { ascending: false })
  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

export default reviews
