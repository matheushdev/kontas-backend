import { FastifyInstance } from 'fastify'

import {
  CreateUserInput,
  createUserResponseSchemaJson,
  createUserSchemaJson,
  LoginInput,
  loginResponseSchemaJson,
  loginSchemaJson,
  profileResponseSchemaJson,
} from '@/http/modules/user/user.schema'
import { loginHandler, profileHandler, registerUserHandler } from '@/http/modules/user/user.controller'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-type'

import { defaultErrorResponses } from '@/utils/defaultResponses'

async function userRoutes(app: FastifyInstance) {
  app.post<{
    Body: CreateUserInput
  }>(
    '/',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Cria um novo usuário no sistema.',
        summary: 'Criação de usuário.',
        tags: ['Administrator - User'],
        body: createUserSchemaJson,
        response: {
          201: {
            description: 'Usuário criado com sucesso.',
            content: {
              'application/json': {
                schema: createUserResponseSchemaJson,
              },
            },
          },
          ...defaultErrorResponses,
        },
        security: [
          {
            apiKey: [],
          },
        ],
      },
    },
    registerUserHandler,
  )

  app.post<{
    Body: LoginInput
  }>(
    '/auth',
    {
      schema: {
        description: 'Autentica um usuário no sistema.',
        summary: 'Login de usuário.',
        tags: ['User'],
        body: loginSchemaJson,
        response: {
          200: {
            description: 'Login realizado com sucesso.',
            content: {
              'application/json': {
                schema: loginResponseSchemaJson,
              },
            },
          },
          ...defaultErrorResponses,
        },
      },
    },
    loginHandler,
  )

  app.get(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna o perfil do usuário autenticado no sistema.',
        summary: 'Buscar perfil do usuário.',
        tags: ['User'],
        response: {
          200: {
            description: 'teste.',
            content: {
              'application/json': {
                schema: profileResponseSchemaJson,
              },
            },
          },
          ...defaultErrorResponses,
        },
        security: [
          {
            apiKey: [],
          },
        ],
      },
    },
    profileHandler,
  )
}

export { userRoutes }
