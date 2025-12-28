export type AuthUser = {
  id: string
  email?: string | null
}

export type Variables = {
  accessToken: string
  user: AuthUser
}

declare module 'hono' {
  interface ContextVariableMap extends Variables {}
}
