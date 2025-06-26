import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ZodError, ZodIssue } from 'zod'

import { errorMessages } from '@/utils/errorMessages'

function translateErrorMessage(template: string, field: string, params: any): string {
  let message = template.replace(/{field}/g, field)

  if (params.limit) message = message.replace(/{limit}/g, params.limit)

  if (params.type) message = message.replace(/{expectedType}/g, params.type)

  return message
}

export function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply) {
  if (process.env.NODE_ENV === 'development') console.error('\n\n\n------\n[MODO DEVELOPER ERROR]:\n\n', error)

  if (error.validation && error.validationContext === 'body') {
    const validationErrors = error.validation.map((err: any) => {
      const template = errorMessages[err.keyword]
      let field = err.instancePath.substring(1)

      if (err.keyword === 'required' && err.params.missingProperty) field = err.params.missingProperty

      const translatedMessage = template ? translateErrorMessage(template, field, err.params) : 'Erro de validação.'

      return {
        code: err.keyword,
        message: translatedMessage,
        path: field ? `/${field}` : '',
      }
    })

    return reply.status(400).send({
      message: 'Erro de validação!',
      errors: validationErrors,
    })
  }

  if (error.validation && error.validationContext === 'params') {
    const validationErrors = error.validation.map((err: any) => {
      const template = errorMessages[err.keyword]
      const field = err.instancePath.substring(1)

      const translatedMessage = template ? translateErrorMessage(template, field, err.params) : 'Erro de validação nos parâmetros.'

      return {
        code: err.keyword,
        message: translatedMessage,
        path: field ? `/${field}` : '',
      }
    })

    return reply.status(400).send({
      message: 'Erro de validação nos parâmetros!',
      errors: validationErrors,
    })
  }

  if (error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
    const translatedMessage = errorMessages.FST_ERR_CTP_BODY_TOO_LARGE
    return reply.status(413).send({
      message: translatedMessage,
    })
  }

  if (error.code === 'FST_ERR_CTP_EMPTY_JSON_BODY') {
    const translatedMessage = errorMessages.FST_ERR_CTP_EMPTY_JSON_BODY
    return reply.status(400).send({
      message: translatedMessage,
    })
  }

  // Error in Prisma:
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[]) || []
      const fieldNames = fields.join(', ')
      return reply.code(400).send({
        message: `Já existe um registro com o${fields.length > 0 ? '' : 's'} valor${fields.length > 0 ? '' : 'es'} único${fields.length > 0 ? '' : 's'} para o${fields.length > 0 ? '' : 's'} campo${fields.length > 0 ? '' : 's'} '${fieldNames}'. Por favor, verifique e tente novamente.`,
      })
    }

    if (error.code === 'P2003') {
      const relatedField = error.meta?.field_name || 'algum campo'
      return reply.code(400).send({
        message: `Não foi possível realizar a ação porque este item está conectado ao campo '${relatedField}' em outras partes do sistema. Verifique a relação deste item com outros dados antes de tentar novamente.`,
      })
    }

    if (error.code === 'P2025')
      return reply.status(404).send({
        message: 'O registro solicitado não foi encontrado.',
      })
  }

  // Prisma Client Initialization Error
  if (error instanceof PrismaClientInitializationError) {
    return reply.code(500).send({
      message:
        'Não foi possível conectar ao banco de dados.\nPor favor, verifique se o servidor do banco está em execução e se as configurações estão corretas.',
      details: error.message,
    })
  }

  // Error zod:
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((issue: ZodIssue) => {
      if (issue.code === 'invalid_type') {
        return {
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
          expected: issue.expected,
          received: issue.received,
        }
      }

      return {
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }
    })

    return reply.status(400).send({
      message: 'Erro de validação!',
      errors: validationErrors,
    })
  }

  // Error generic:
  if (error instanceof Error) {
    console.error('[GENERIC ERROR]:', error)
    return reply.code(400).send({ message: error.message })
  }

  // Error is not identified:
  console.error('[UNKNOWN ERROR]:', error)
  return reply.status(500).send({ message: 'Erro do Servidor Interno!', error })
}
