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

app.route('/reviews', reviews)

export default app
