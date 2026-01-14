import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Variables } from './types/context'
import reviews from './routes/reviews'
import chat from './routes/chat'
import type { Env } from './types/env'
import animeSearch from './routes/animeSearch'
import animeDetail from './routes/animeDetail'
import threads from './routes/threads'
import profiles from './routes/profiles'
const app = new Hono<{
  Variables: Variables
  Bindings: Env        // ★これが env の正体
}>()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)


// ★ ヘルスチェックを必ず置く
app.get('/health', c =>
  c.json({ status: 'ok', service: 'astra-api' })
)

app.route("/api/anime/search", animeSearch);
app.route("/api/anime", animeDetail);
app.route('/reviews', reviews)
app.route('/chat', chat)
app.route("/threads", threads)
app.route("/profiles", profiles)

export default app
