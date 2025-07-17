import { FastifyRequest, FastifyReply } from 'fastify'

import {
  CreateCardAccountInput,
  UpdateCardAccountBodyParams,
  CardAccountParamsInput,
  CardAccountsByUserParamsInput,
} from '@/http/modules/cards-accounts/cards-accounts.schema'
import {
  createCardAccount,
  findCardAccountById,
  findCardAccounts,
  updateCardAccount,
  deleteCardAccount,
  findCardAccountsByUser,
  findCardAccountsByType,
  toggleCardAccountStatus,
  getCardAccountStats,
  getUserCardAccountsSummary,
} from '@/http/modules/cards-accounts/cards-accounts.service'

export async function createCardAccountHandler(
  request: FastifyRequest<{
    Body: CreateCardAccountInput
  }>,
  reply: FastifyReply,
) {
  const { sub } = request.user
  const cardAccount = await createCardAccount(request.body, sub)
  return reply.code(201).send({
    message: `Conta/cartão '${cardAccount.name}' foi criada com sucesso!`,
    data: cardAccount,
  })
}

export async function getCardAccountHandler(
  request: FastifyRequest<{
    Params: CardAccountParamsInput
  }>,
  reply: FastifyReply,
) {
  const { card_account_id } = request.params
  const cardAccount = await findCardAccountById(parseInt(card_account_id))
  return reply.code(200).send(cardAccount)
}

export async function listCardAccountsHandler(
  request: FastifyRequest<{
    Querystring: {
      type?: string
      active?: boolean
      user_id?: number
      page?: number
      limit?: number
    }
  }>,
  reply: FastifyReply,
) {
  const { type, active, user_id, page = 1, limit = 10 } = request.query
  const { cardAccounts, total } = await findCardAccounts({
    type,
    active,
    user_id,
    page,
    limit,
  })
  return reply.code(200).send({
    cardAccounts,
    total,
    page,
    limit,
  })
}

export async function updateCardAccountHandler(
  request: FastifyRequest<{
    Params: CardAccountParamsInput
    Body: UpdateCardAccountBodyParams
  }>,
  reply: FastifyReply,
) {
  const { card_account_id } = request.params
  const cardAccount = await updateCardAccount(parseInt(card_account_id), request.body)
  return reply.code(200).send({
    message: `Conta/cartão '${cardAccount.name}' foi atualizada com sucesso!`,
    data: cardAccount,
  })
}

export async function deleteCardAccountHandler(
  request: FastifyRequest<{
    Params: CardAccountParamsInput
  }>,
  reply: FastifyReply,
) {
  const { card_account_id } = request.params
  await deleteCardAccount(parseInt(card_account_id))
  return reply.code(200).send({
    message: 'Conta/cartão foi excluída com sucesso!',
  })
}

export async function listCardAccountsByUserHandler(
  request: FastifyRequest<{
    Params: CardAccountsByUserParamsInput
  }>,
  reply: FastifyReply,
) {
  const { user_id } = request.params
  const cardAccounts = await findCardAccountsByUser(parseInt(user_id))
  return reply.code(200).send(cardAccounts)
}

export async function listCardAccountsByTypeHandler(
  request: FastifyRequest<{
    Params: {
      type: string
    }
  }>,
  reply: FastifyReply,
) {
  const { type } = request.params
  const cardAccounts = await findCardAccountsByType(type)
  return reply.code(200).send(cardAccounts)
}

export async function toggleCardAccountStatusHandler(
  request: FastifyRequest<{
    Params: CardAccountParamsInput
  }>,
  reply: FastifyReply,
) {
  const { card_account_id } = request.params
  const cardAccount = await toggleCardAccountStatus(parseInt(card_account_id))
  const status = cardAccount.active ? 'ativada' : 'desativada'
  return reply.code(200).send({
    message: `Conta/cartão '${cardAccount.name}' foi ${status} com sucesso!`,
    data: cardAccount,
  })
}

export async function getCardAccountStatsHandler(
  request: FastifyRequest<{
    Params: CardAccountParamsInput
  }>,
  reply: FastifyReply,
) {
  const { card_account_id } = request.params
  const result = await getCardAccountStats(parseInt(card_account_id))
  return reply.code(200).send(result)
}

export async function getUserCardAccountsSummaryHandler(
  request: FastifyRequest<{
    Params: CardAccountsByUserParamsInput
  }>,
  reply: FastifyReply,
) {
  const { user_id } = request.params
  const cardAccounts = await getUserCardAccountsSummary(parseInt(user_id))
  return reply.code(200).send(cardAccounts)
}
