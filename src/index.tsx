import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Variables } from './types/context'
import reviews from './routes/reviews'
const app = new Hono<{
  Variables: Variables
}>()

app.use('*', cors({
  origin: '*', // 後で Next.js ドメインだけに絞る
}))

app.route('/reviews', reviews)
export default app
