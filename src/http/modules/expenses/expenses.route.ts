import { FastifyInstance } from 'fastify'

import {
  CreateExpenseInput,
  UpdateExpenseBodyParams,
  ExpenseParamsInput,
  UserExpensesParamsInput,
  createExpenseSchemaJson,
  createExpenseResponseSchemaJson,
  getExpenseResponseSchemaJson,
  listExpensesResponseSchemaJson,
  updateExpenseBodySchemaJson,
  expenseParamsSchemaJson,
  userExpensesParamsSchemaJson,
} from '@/http/modules/expenses/expenses.schema'
import {
  createExpenseHandler,
  getExpenseHandler,
  listExpensesHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
  listExpensesByUserHandler,
  listExpensesByCategoryHandler,
  getExpenseStatsHandler,
  getUserExpensesSummaryHandler,
  getExpensesByDateRangeHandler,
  getExpensesByAmountRangeHandler,
} from '@/http/modules/expenses/expenses.controller'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-type'

import { defaultErrorResponses } from '@/utils/defaultResponses'

async function expensesRoutes(app: FastifyInstance) {
  app.delete<{
    Params: ExpenseParamsInput
  }>(
    '/:expense_id',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Exclui uma despesa do sistema.',
        summary: 'Excluir despesa.',
        tags: ['Administrator - Expenses'],
        params: expenseParamsSchemaJson,
        response: {
          200: {
            description: 'Despesa excluída com sucesso.',
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
    deleteExpenseHandler,
  )

  app.post<{
    Body: CreateExpenseInput
  }>(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Cria uma nova despesa no sistema com responsáveis.',
        summary: 'Criação de despesa.',
        tags: ['Expenses'],
        body: createExpenseSchemaJson,
        response: {
          201: {
            description: 'Despesa criada com sucesso.',
            content: {
              'application/json': {
                schema: createExpenseResponseSchemaJson,
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
    createExpenseHandler,
  )

  app.get<{
    Querystring: {
      category_id?: string
      card_account_id?: string
      user_id?: string
      start_date?: string
      end_date?: string
      min_amount?: string
      max_amount?: string
      page?: string
      limit?: string
    }
  }>(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista todas as despesas do sistema com filtros opcionais.',
        summary: 'Listar despesas.',
        tags: ['Expenses'],
        querystring: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por categoria',
            },
            card_account_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por conta/cartão',
            },
            user_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por usuário responsável',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data inicial do período (ISO 8601)',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data final do período (ISO 8601)',
            },
            min_amount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Valor mínimo',
            },
            max_amount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Valor máximo',
            },
            page: {
              type: 'string',
              pattern: '^\\d+$',
              default: '1',
              description: 'Número da página',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '10',
              description: 'Limite de itens por página (máximo 100)',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de despesas retornada com sucesso.',
            content: {
              'application/json': {
                schema: listExpensesResponseSchemaJson,
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
    listExpensesHandler,
  )

  app.get<{
    Params: ExpenseParamsInput
  }>(
    '/:expense_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna uma despesa específica pelo ID.',
        summary: 'Buscar despesa por ID.',
        tags: ['Expenses'],
        params: expenseParamsSchemaJson,
        response: {
          200: {
            description: 'Despesa encontrada com sucesso.',
            content: {
              'application/json': {
                schema: getExpenseResponseSchemaJson,
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
    getExpenseHandler,
  )

  app.put<{
    Params: ExpenseParamsInput
    Body: UpdateExpenseBodyParams
  }>(
    '/:expense_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Atualiza uma despesa existente.',
        summary: 'Atualizar despesa.',
        tags: ['Expenses'],
        params: expenseParamsSchemaJson,
        body: updateExpenseBodySchemaJson,
        response: {
          200: {
            description: 'Despesa atualizada com sucesso.',
            content: {
              'application/json': {
                schema: createExpenseResponseSchemaJson,
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
    updateExpenseHandler,
  )

  app.get<{
    Params: UserExpensesParamsInput
    Querystring: {
      start_date?: string
      end_date?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>(
    '/user/:user_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista despesas de um usuário específico.',
        summary: 'Listar despesas por usuário.',
        tags: ['Expenses'],
        params: userExpensesParamsSchemaJson,
        querystring: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data inicial do período',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data final do período',
            },
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por categoria',
            },
            page: {
              type: 'string',
              pattern: '^\\d+$',
              default: '1',
              description: 'Número da página',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '10',
              description: 'Limite de itens por página',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de despesas do usuário retornada com sucesso.',
            content: {
              'application/json': {
                schema: listExpensesResponseSchemaJson,
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
    listExpensesByUserHandler,
  )

  app.get<{
    Params: {
      category_id: string
    }
  }>(
    '/category/:category_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista despesas de uma categoria específica.',
        summary: 'Listar despesas por categoria.',
        tags: ['Expenses'],
        params: {
          type: 'object',
          properties: {
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
          required: ['category_id'],
        },
        response: {
          200: {
            description: 'Lista de despesas da categoria retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: getExpenseResponseSchemaJson,
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
    listExpensesByCategoryHandler,
  )

  app.get<{
    Params: ExpenseParamsInput
  }>(
    '/:expense_id/stats',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna estatísticas e valores individuais de uma despesa.',
        summary: 'Estatísticas da despesa.',
        tags: ['Expenses'],
        params: expenseParamsSchemaJson,
        response: {
          200: {
            description: 'Estatísticas da despesa retornadas com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    expense: getExpenseResponseSchemaJson,
                    stats: {
                      type: 'object',
                      properties: {
                        totalOwners: { type: 'integer' },
                        individualAmounts: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              user: {
                                type: 'object',
                                properties: {
                                  user_id: { type: 'integer' },
                                  username: { type: 'string' },
                                  full_name: { type: 'string' },
                                  profile_picture: { type: 'string' },
                                },
                              },
                              percentage: { type: 'number' },
                              amount: { type: 'number' },
                            },
                          },
                        },
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
    getExpenseStatsHandler,
  )

  app.get<{
    Params: UserExpensesParamsInput
    Querystring: {
      start_date?: string
      end_date?: string
      category_id?: string
    }
  }>(
    '/user/:user_id/summary',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna resumo das despesas de um usuário com agrupamentos.',
        summary: 'Resumo das despesas do usuário.',
        tags: ['Expenses'],
        params: userExpensesParamsSchemaJson,
        querystring: {
          type: 'object',
          properties: {
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data inicial do período',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data final do período',
            },
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por categoria',
            },
          },
        },
        response: {
          200: {
            description: 'Resumo das despesas do usuário retornado com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        user_id: { type: 'integer' },
                        username: { type: 'string' },
                        full_name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        totalExpenses: { type: 'integer' },
                        totalAmount: { type: 'number' },
                        expensesByCategories: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              category: {
                                type: 'object',
                                properties: {
                                  category_id: { type: 'integer' },
                                  name: { type: 'string' },
                                  color: { type: 'string' },
                                },
                              },
                              count: { type: 'integer' },
                              totalAmount: { type: 'number' },
                            },
                          },
                        },
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
    getUserExpensesSummaryHandler,
  )

  app.get<{
    Querystring: {
      start_date: string
      end_date: string
      user_id?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>(
    '/date-range',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista despesas em um período específico.',
        summary: 'Listar despesas por período.',
        tags: ['Expenses'],
        querystring: {
          type: 'object',
          required: ['start_date', 'end_date'],
          properties: {
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data inicial do período (obrigatória)',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Data final do período (obrigatória)',
            },
            user_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por usuário',
            },
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por categoria',
            },
            page: {
              type: 'string',
              pattern: '^\\d+$',
              default: '1',
              description: 'Número da página',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '10',
              description: 'Limite de itens por página',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de despesas do período retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    listExpensesResponseSchemaJson,
                    {
                      type: 'object',
                      properties: {
                        dateRange: {
                          type: 'object',
                          properties: {
                            start_date: { type: 'string' },
                            end_date: { type: 'string' },
                          },
                        },
                      },
                    },
                  ],
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
    getExpensesByDateRangeHandler,
  )

  app.get<{
    Querystring: {
      min_amount: string
      max_amount: string
      user_id?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>(
    '/amount-range',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista despesas em uma faixa de valores específica.',
        summary: 'Listar despesas por faixa de valores.',
        tags: ['Expenses'],
        querystring: {
          type: 'object',
          required: ['min_amount', 'max_amount'],
          properties: {
            min_amount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Valor mínimo (obrigatório)',
            },
            max_amount: {
              type: 'string',
              pattern: '^\\d+(\\.\\d{1,2})?$',
              description: 'Valor máximo (obrigatório)',
            },
            user_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por usuário',
            },
            category_id: {
              type: 'string',
              pattern: '^\\d+$',
              description: 'Filtrar por categoria',
            },
            page: {
              type: 'string',
              pattern: '^\\d+$',
              default: '1',
              description: 'Número da página',
            },
            limit: {
              type: 'string',
              pattern: '^\\d+$',
              default: '10',
              description: 'Limite de itens por página',
            },
          },
        },
        response: {
          200: {
            description: 'Lista de despesas da faixa de valores retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    listExpensesResponseSchemaJson,
                    {
                      type: 'object',
                      properties: {
                        amountRange: {
                          type: 'object',
                          properties: {
                            min_amount: { type: 'number' },
                            max_amount: { type: 'number' },
                          },
                        },
                      },
                    },
                  ],
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
    getExpensesByAmountRangeHandler,
  )
}

export { expensesRoutes }
