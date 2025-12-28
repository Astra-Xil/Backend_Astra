import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Variables } from './types/context'
import reviews from './routes/reviews'
import type { Env } from './types/env'

const app = new Hono<{
  Variables: Variables
  Bindings: Env        // ★これが env の正体
}>()

app.use(
  '*',
  cors({
    origin: '*',
  })
)

// ★ ヘルスチェックを必ず置く
app.get('/health', c =>
  c.json({ status: 'ok', service: 'astra-api' })
)
app.get('/debug/env', c => {
  return c.json({
    SUPABASE_URL: c.env.SUPABASE_URL ?? null,
    SUPABASE_ANON_KEY: c.env.SUPABASE_ANON_KEY ? 'exists' : null,
  })
})

app.route('/reviews', reviews)

export default app
