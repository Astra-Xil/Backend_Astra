export type AuthUser = {
  id: string
}

export type Variables = {
  accessToken: string
  user: AuthUser
}

declare module 'hono' {
  interface ContextVariableMap extends Variables {}
}
