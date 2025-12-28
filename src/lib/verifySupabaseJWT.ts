import { jwtVerify, createRemoteJWKSet } from 'jose'

const SUPABASE_URL = 'https://uwslzazuagjzbfnmfvft.supabase.co'

const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)

export async function verifySupabaseJWT(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    audience: 'authenticated',
    issuer: `${SUPABASE_URL}/auth/v1`,
  })

  return payload
}
