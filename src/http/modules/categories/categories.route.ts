import { FastifyInstance } from 'fastify'

import {
  CreateCategoryInput,
  UpdateCategoryBodyParams,
  CategoryParamsInput,
  createCategorySchemaJson,
  createCategoryResponseSchemaJson,
  getCategoryResponseSchemaJson,
  listCategoriesResponseSchemaJson,
  updateCategoryBodySchemaJson,
  categoryParamsSchemaJson,
} from '@/http/modules/categories/categories.schema'
import {
  createCategoryHandler,
  getCategoryHandler,
  listCategoriesHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  listCategoriesByTypeHandler,
  toggleCategoryStatusHandler,
  getCategoryStatsHandler,
} from '@/http/modules/categories/categories.controller'

import { verifyJwt } from '@/http/middlewares/verify-jwt'
import { verifyUserRole } from '@/http/middlewares/verify-user-type'

import { defaultErrorResponses } from '@/utils/defaultResponses'
import { CategoryType } from '@prisma/client'

async function categoriesRoutes(app: FastifyInstance) {
  app.post<{
    Body: CreateCategoryInput
  }>(
    '/',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Cria uma nova categoria no sistema.',
        summary: 'Criação de categoria.',
        tags: ['Administrator - Categories'],
        body: createCategorySchemaJson,
        response: {
          201: {
            description: 'Categoria criada com sucesso.',
            content: {
              'application/json': {
                schema: createCategoryResponseSchemaJson,
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
    createCategoryHandler,
  )

  app.get<{
    Querystring: {
      type?: CategoryType
      active?: boolean
      page?: number
      limit?: number
    }
  }>(
    '/',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista todas as categorias do sistema com filtros opcionais.',
        summary: 'Listar categorias.',
        tags: ['Categories'],
        querystring: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['INCOME', 'EXPENSE'],
              description: 'Filtrar por tipo de categoria',
            },
            active: {
              type: 'boolean',
              description: 'Filtrar por status ativo',
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
            description: 'Lista de categorias retornada com sucesso.',
            content: {
              'application/json': {
                schema: listCategoriesResponseSchemaJson,
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
    listCategoriesHandler,
  )

  app.get<{
    Params: CategoryParamsInput
  }>(
    '/:category_id',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna uma categoria específica pelo ID.',
        summary: 'Buscar categoria por ID.',
        tags: ['Categories'],
        params: categoryParamsSchemaJson,
        response: {
          200: {
            description: 'Categoria encontrada com sucesso.',
            content: {
              'application/json': {
                schema: getCategoryResponseSchemaJson,
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
    getCategoryHandler,
  )

  app.put<{
    Params: CategoryParamsInput
    Body: UpdateCategoryBodyParams
  }>(
    '/:category_id',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Atualiza uma categoria existente.',
        summary: 'Atualizar categoria.',
        tags: ['Administrator - Categories'],
        params: categoryParamsSchemaJson,
        body: updateCategoryBodySchemaJson,
        response: {
          200: {
            description: 'Categoria atualizada com sucesso.',
            content: {
              'application/json': {
                schema: createCategoryResponseSchemaJson,
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
    updateCategoryHandler,
  )

  app.delete<{
    Params: CategoryParamsInput
  }>(
    '/:category_id',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Exclui uma categoria do sistema.',
        summary: 'Excluir categoria.',
        tags: ['Administrator - Categories'],
        params: categoryParamsSchemaJson,
        response: {
          200: {
            description: 'Categoria excluída com sucesso.',
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
    deleteCategoryHandler,
  )

  app.get<{
    Params: {
      type: CategoryType
    }
  }>(
    '/type/:type',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Lista categorias ativas por tipo específico.',
        summary: 'Listar categorias por tipo.',
        tags: ['Categories'],
        params: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['INCOME', 'EXPENSE'],
            },
          },
          required: ['type'],
        },
        response: {
          200: {
            description: 'Lista de categorias por tipo retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: getCategoryResponseSchemaJson,
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
    listCategoriesByTypeHandler,
  )

  app.patch<{
    Params: CategoryParamsInput
  }>(
    '/:category_id/toggle-status',
    {
      onRequest: [verifyJwt, verifyUserRole('admin')],
      schema: {
        description: 'Alterna o status ativo/inativo de uma categoria.',
        summary: 'Alternar status da categoria.',
        tags: ['Administrator - Categories'],
        params: categoryParamsSchemaJson,
        response: {
          200: {
            description: 'Status da categoria alterado com sucesso.',
            content: {
              'application/json': {
                schema: createCategoryResponseSchemaJson,
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
    toggleCategoryStatusHandler,
  )

  app.get<{
    Params: CategoryParamsInput
  }>(
    '/:category_id/stats',
    {
      onRequest: [verifyJwt],
      schema: {
        description: 'Retorna estatísticas de uso de uma categoria.',
        summary: 'Estatísticas da categoria.',
        tags: ['Categories'],
        params: categoryParamsSchemaJson,
        response: {
          200: {
            description: 'Estatísticas da categoria retornadas com sucesso.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    category: getCategoryResponseSchemaJson,
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
    getCategoryStatsHandler,
  )
}

export { categoriesRoutes }
