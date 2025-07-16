import { CategoryType } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'

import { CreateCategoryInput, UpdateCategoryBodyParams, CategoryParamsInput } from '@/http/modules/categories/categories.schema'
import {
  createCategory,
  findCategoryById,
  findCategories,
  updateCategory,
  deleteCategory,
  findCategoriesByType,
  toggleCategoryStatus,
  getCategoryStats,
} from '@/http/modules/categories/categories.service'

export async function createCategoryHandler(
  request: FastifyRequest<{
    Body: CreateCategoryInput
  }>,
  reply: FastifyReply,
) {
  const category = await createCategory(request.body)
  return reply.code(201).send({
    message: `Categoria '${category.name}' foi criada com sucesso!`,
    data: category,
  })
}

export async function getCategoryHandler(
  request: FastifyRequest<{
    Params: CategoryParamsInput
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  const category = await findCategoryById(parseInt(category_id))
  return reply.code(200).send(category)
}

export async function listCategoriesHandler(
  request: FastifyRequest<{
    Querystring: {
      type?: CategoryType
      active?: boolean
      page?: number
      limit?: number
    }
  }>,
  reply: FastifyReply,
) {
  const { type, active, page = 1, limit = 10 } = request.query
  const { categories, total } = await findCategories({
    type,
    active,
    page,
    limit,
  })
  return reply.code(200).send({
    categories,
    total,
    page,
    limit,
  })
}

export async function updateCategoryHandler(
  request: FastifyRequest<{
    Params: CategoryParamsInput
    Body: UpdateCategoryBodyParams
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  const category = await updateCategory(parseInt(category_id), request.body)
  return reply.code(200).send({
    message: `Categoria '${category.name}' foi atualizada com sucesso!`,
    data: category,
  })
}

export async function deleteCategoryHandler(
  request: FastifyRequest<{
    Params: CategoryParamsInput
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  await deleteCategory(parseInt(category_id))
  return reply.code(200).send({
    message: 'Categoria foi excluída com sucesso!',
  })
}

export async function listCategoriesByTypeHandler(
  request: FastifyRequest<{
    Params: {
      type: CategoryType
    }
  }>,
  reply: FastifyReply,
) {
  const { type } = request.params
  const categories = await findCategoriesByType(type)
  return reply.code(200).send(categories)
}

export async function toggleCategoryStatusHandler(
  request: FastifyRequest<{
    Params: CategoryParamsInput
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  const category = await toggleCategoryStatus(parseInt(category_id))
  const status = category.active ? 'ativada' : 'desativada'
  return reply.code(200).send({
    message: `Categoria '${category.name}' foi ${status} com sucesso!`,
    data: category,
  })
}

export async function getCategoryStatsHandler(
  request: FastifyRequest<{
    Params: CategoryParamsInput
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  const result = await getCategoryStats(parseInt(category_id))
  return reply.code(200).send(result)
}
