import { FastifyReply, FastifyRequest } from 'fastify'

import { CreateUserInput, LoginInput } from '@/http/modules/user/user.schema'
import { createUser, findUserById, findUserByUsername } from '@/http/modules/user/user.service'
import { verifyPassword } from '@/utils/hash'

export async function registerUserHandler(
  request: FastifyRequest<{
    Body: CreateUserInput
  }>,
  reply: FastifyReply,
) {
  const user = await createUser(request.body)
  return reply.code(201).send({
    message: `Usuário '${user.username}' foi criado com sucesso!`,
    data: user,
  })
}

export async function loginHandler(
  request: FastifyRequest<{
    Body: LoginInput
  }>,
  reply: FastifyReply,
) {
  const body = request.body
  const user = await findUserByUsername(body.username)
  if (!user) throw reply.code(404).send({ message: 'Nome de usuário ou senha inválidos.' })

  const doestPasswordMatches = await verifyPassword(body.password, user.password)

  if (!doestPasswordMatches) throw reply.status(404).send({ message: 'Nome de usuário ou senha inválidos.' })

  const token = await reply.jwtSign(
    {
      username: user.username,
      user_type: user.user_type,
      sub: user.user_id,
    },
    { expiresIn: '7d' },
  )

  const refreshToken = await reply.jwtSign(
    {
      username: user.username,
      user_type: user.user_type,
      sub: user.user_id,
    },
    { expiresIn: '7d' },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({ token, user })
}

export async function profileHandler(request: FastifyRequest, reply: FastifyReply) {
  const { sub } = request.user
  const user = await findUserById(sub)
  return reply.code(201).send(user)
}
