import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { createSupabaseClient } from '../lib/supabase'
import { analyzePerspectiveDirect } from '../lib/analyzePerspectiveDirect'
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

  const text = comment

  const user = c.get('user')
  const accessToken = c.get('accessToken')
  const supabase = createSupabaseClient(c.env, accessToken)

  // =======================
  // ① NGワード
  // =======================
  const NG_WORDS = ['死ね', '殺す', '障害者', 'レイプ', '薬物', '爆破', '自殺']
  if (NG_WORDS.some(w => text.includes(w))) {
    return c.json({ error: '不適切な表現が含まれています。' }, 400)
  }

  // =======================
  // ② 個人情報
  // =======================
  const personalPatterns = [
    /\b0\d{1,4}-\d{1,4}-\d{3,4}\b/,
    /\b0\d{9,10}\b/,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    /\b\d{3}-\d{4}\b/,
  ]

  if (personalPatterns.some(re => re.test(text))) {
    return c.json({ error: '個人情報を含む内容は投稿できません。' }, 400)
  }

  // =======================
  // ③ Perspective（3秒）
  // =======================
  let toxicity = 0
  let insult = 0
  let profanity = 0

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const result = await analyzePerspectiveDirect(text, controller.signal)
    clearTimeout(timeoutId)

    toxicity = result.attributeScores?.TOXICITY?.summaryScore?.value ?? 0
    insult = result.attributeScores?.INSULT?.summaryScore?.value ?? 0
    profanity = result.attributeScores?.PROFANITY?.summaryScore?.value ?? 0
  } catch {
    // 死んでも通す
  }

  if (toxicity > 0.75 || insult > 0.7 || profanity > 0.65) {
    return c.json({ error: '不適切な表現が含まれています。' }, 400)
  }

  // =======================
  // ④ INSERT
  // =======================
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
  const anime_id = c.req.query('anime_id')
  const supabase = createSupabaseClient(c.env)
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('anime_id', anime_id)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({ data })
})

export default reviews
