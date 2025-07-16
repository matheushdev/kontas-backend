import { FastifyReply, FastifyRequest } from 'fastify'

export function verifyUserRole(roleToVerify: 'admin' | 'member') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { user_type } = request.user
    if (user_type !== roleToVerify) throw reply.status(401).send({ message: 'Não autorizado.' })
  }
}
