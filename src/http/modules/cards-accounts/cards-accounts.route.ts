import { FastifyInstance } from 'fastify'

import {
  CreateCardAccountInput,
  UpdateCardAccountBodyParams,
  CardAccountParamsInput,
  CardAccountsByUserParamsInput,
  createCardAccountSchemaJson,
  createCardAccountResponseSchemaJson,
  getCardAccountResponseSchemaJson,
  listCardAccountsResponseSchemaJson,
  updateCardAccountBodySchemaJson,
  cardAccountParamsSchemaJson,
  cardAccountsByUserParamsSchemaJson,
} from '@/http/modules/cards-accounts/cards-accounts.schema'
import {
  createCardAccountHandler,
  getCardAccountHandler,
  listCardAccountsHandler,
  updateCardAccountHandler,
  deleteCardAccountHandler,
  listCardAccountsByUserHandler,
  listCardAccountsByTypeHandler,
  toggleCardAccountStatusHandler,
  getCardAccountStatsHandler,
  getUserCardAccountsSummaryHandler,
} from '@/http/modules/cards-accounts/cards-accounts.controller'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-type'

import { defaultErrorResponses } from '@/utils/defaultResponses'

async function cardsAccountsRoutes(app: FastifyInstance) {
  app.delete<{
    Params: CardAccountParamsInput
  }>(
    '/:card_account_id',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Exclui uma conta/cartão do sistema.',
        summary: 'Excluir conta/cartão.',
        tags: ['Administrator - Cards & Accounts'],
        params: cardAccountParamsSchemaJson,
        response: {
          200: {
            description: 'Conta/cartão excluída com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
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
    deleteCardAccountHandler,
  )

  app.post<{
    Body: CreateCardAccountInput
  }>(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Cria uma nova conta/cartão no sistema.',
        summary: 'Criação de conta/cartão.',
        tags: ['Cards & Accounts'],
        body: createCardAccountSchemaJson,
        response: {
          201: {
            description: 'Conta/cartão criada com sucesso.',
            content: {
              'application/json': {
                schema: createCardAccountResponseSchemaJson,
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
    createCardAccountHandler,
  )

  app.get<{
    Querystring: {
      type?: string
      active?: boolean
      user_id?: number
      page?: number
      limit?: number
    }
  }>(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista todas as contas/cartões do sistema com filtros opcionais.',
        summary: 'Listar contas/cartões.',
        tags: ['Cards & Accounts'],
        querystring: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'PIX', 'CASH'],
              description: 'Filtrar por tipo de conta/cartão',
            },
            active: {
              type: 'boolean',
              description: 'Filtrar por status ativo',
            },
            user_id: {
              type: 'integer',
              minimum: 1,
              description: 'Filtrar por usuário',
            },
            page: {
              type: 'integer',
              minimum: 1,
              default: 1,
              description: 'Número da página',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Limite de itens por página',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de contas/cartões retornada com sucesso.',
            content: {
              'application/json': {
                schema: listCardAccountsResponseSchemaJson,
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
    listCardAccountsHandler,
  )

  app.get<{
    Params: CardAccountParamsInput
  }>(
    '/:card_account_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna uma conta/cartão específica pelo ID.',
        summary: 'Buscar conta/cartão por ID.',
        tags: ['Cards & Accounts'],
        params: cardAccountParamsSchemaJson,
        response: {
          200: {
            description: 'Conta/cartão encontrada com sucesso.',
            content: {
              'application/json': {
                schema: getCardAccountResponseSchemaJson,
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
    getCardAccountHandler,
  )

  app.put<{
    Params: CardAccountParamsInput
    Body: UpdateCardAccountBodyParams
  }>(
    '/:card_account_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Atualiza uma conta/cartão existente.',
        summary: 'Atualizar conta/cartão.',
        tags: ['Cards & Accounts'],
        params: cardAccountParamsSchemaJson,
        body: updateCardAccountBodySchemaJson,
        response: {
          200: {
            description: 'Conta/cartão atualizada com sucesso.',
            content: {
              'application/json': {
                schema: createCardAccountResponseSchemaJson,
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
    updateCardAccountHandler,
  )

  app.get<{
    Params: CardAccountsByUserParamsInput
  }>(
    '/user/:user_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista contas/cartões ativas de um usuário específico.',
        summary: 'Listar contas/cartões por usuário.',
        tags: ['Cards & Accounts'],
        params: cardAccountsByUserParamsSchemaJson,
        response: {
          200: {
            description: 'Lista de contas/cartões do usuário retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: getCardAccountResponseSchemaJson,
                },
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
    listCardAccountsByUserHandler,
  )

  app.get<{
    Params: {
      type: string
    }
  }>(
    '/type/:type',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista contas/cartões ativas por tipo específico.',
        summary: 'Listar contas/cartões por tipo.',
        tags: ['Cards & Accounts'],
        params: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'PIX', 'CASH'],
            },
          },
          required: ['type'],
        },
        response: {
          200: {
            description: 'Lista de contas/cartões por tipo retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: getCardAccountResponseSchemaJson,
                },
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
    listCardAccountsByTypeHandler,
  )

  app.patch<{
    Params: CardAccountParamsInput
  }>(
    '/:card_account_id/toggle-status',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Alterna o status ativo/inativo de uma conta/cartão.',
        summary: 'Alternar status da conta/cartão.',
        tags: ['Cards & Accounts'],
        params: cardAccountParamsSchemaJson,
        response: {
          200: {
            description: 'Status da conta/cartão alterado com sucesso.',
            content: {
              'application/json': {
                schema: createCardAccountResponseSchemaJson,
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
    toggleCardAccountStatusHandler,
  )

  app.get<{
    Params: CardAccountParamsInput
  }>(
    '/:card_account_id/stats',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna estatísticas de uso de uma conta/cartão.',
        summary: 'Estatísticas da conta/cartão.',
        tags: ['Cards & Accounts'],
        params: cardAccountParamsSchemaJson,
        response: {
          200: {
            description: 'Estatísticas da conta/cartão retornadas com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    cardAccount: getCardAccountResponseSchemaJson,
                    stats: {
                      type: 'object',
                      properties: {
                        expenseCount: { type: 'integer' },
                        incomeCount: { type: 'integer' },
                        totalExpenses: { type: 'number' },
                        totalIncomes: { type: 'number' },
                        totalTransactions: { type: 'integer' },
                      },
                    },
                  },
                },
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
    getCardAccountStatsHandler,
  )

  app.get<{
    Params: CardAccountsByUserParamsInput
  }>(
    '/user/:user_id/summary',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna resumo das contas/cartões de um usuário com contadores de transações.',
        summary: 'Resumo das contas/cartões do usuário.',
        tags: ['Cards & Accounts'],
        params: cardAccountsByUserParamsSchemaJson,
        response: {
          200: {
            description: 'Resumo das contas/cartões do usuário retornado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    allOf: [
                      getCardAccountResponseSchemaJson,
                      {
                        type: 'object',
                        properties: {
                          _count: {
                            type: 'object',
                            properties: {
                              expenses: { type: 'integer' },
                              incomes: { type: 'integer' },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
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
    getUserCardAccountsSummaryHandler,
  )
}

export { cardsAccountsRoutes }
