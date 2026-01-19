import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { createSupabaseClient } from '../lib/supabase'
import { validateText } from '../lib/validateText'
import type { Variables } from '../types/context'
import type { Env } from '../types/env'




const chat = new Hono<{
  Bindings: Env
  Variables: Variables
}>()
chat.post('/', authMiddleware, async c => {
  const { anime_id, thread_id, content } = await c.req.json()

  if (
    typeof anime_id !== 'number' ||
    typeof thread_id !== 'string' ||
    typeof content !== 'string' ||
    content.length === 0 ||
    content.length > 1000
  ) {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  const user = c.get('user')
  const accessToken = c.get('accessToken')
  const supabase = createSupabaseClient(c.env, accessToken)

  const ok = await validateText(content, {
    enablePerspective: true,
    perspectiveTimeoutMs: 1500,
  })

  if (!ok) {
    return c.json({ error: '不適切な表現が含まれています。' }, 400)
  }

  const { data, error } = await supabase
    .from('chat')
    .insert({
      anime_id,
      thread_id,
      content,
      user_id: user.id,
    })
    .select(`
  id,
  anime_id,
  thread_id,
  content,
  created_at,
  user_id,
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

  // ✅ 正の ChatMessage を返す
  return c.json(data)
})


chat.get('/', async c => {
  const threadId = c.req.query('thread_id')

  if (!threadId) {
    return c.json({ error: 'thread_id is required' }, 400)
  }

  const supabase = createSupabaseClient(c.env)

  const { data, error } = await supabase
    .from('chat')
    .select(`
      id,
      anime_id,
      thread_id,
      content,
      created_at,
      user_id,
      profiles (
        id,
        name,
        avatar_url
      )
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})



export default chat;