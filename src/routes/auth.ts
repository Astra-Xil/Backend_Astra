import { Hono } from 'hono'
import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { createClient } from '@supabase/supabase-js'
import type { Env } from '../types/env'
import { SUPABASE_AUTH_COOKIE } from '../lib/supabase'

const auth = new Hono<{
  Bindings: Env
}>()

function isSecureRequest(url: string) {
  return url.startsWith('https://')
}

function createSupabaseServerClient(c: Context<{ Bindings: Env }>) {
  const secure = isSecureRequest(c.req.url)
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
      storageKey: SUPABASE_AUTH_COOKIE,
      storage: {
        getItem: async key => getCookie(c, key) ?? null,
        setItem: async (key, value) => {
          setCookie(c, key, value, {
            httpOnly: true,
            secure,
            sameSite: 'Lax',
            path: '/',
          })
        },
        removeItem: async key => {
          deleteCookie(c, key, { path: '/' })
        },
      },
    },
  })
}

auth.get('/google', async c => {
  const supabase = createSupabaseServerClient(c)
  const redirectTo = new URL('/auth/callback', c.req.url).toString()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

  if (error) return c.text(error.message, 400)
  return c.redirect(data.url)
})

auth.get('/callback', async c => {
  const code = c.req.query('code')
  if (!code) return c.text('Missing code', 400)

  const supabase = createSupabaseServerClient(c)
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return c.text(error.message, 400)

  return c.redirect('/')
})

auth.post('/logout', async c => {
  deleteCookie(c, SUPABASE_AUTH_COOKIE, { path: '/' })
  deleteCookie(c, `${SUPABASE_AUTH_COOKIE}-code-verifier`, { path: '/' })
  return c.json({ ok: true })
})

export default auth
