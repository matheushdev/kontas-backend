import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      username: string
      user_type: string
      sub: number
    }
    user: {
      username: string
      user_type: string
      sub: number
      iat: number
      exp: number
    }
  }
}
