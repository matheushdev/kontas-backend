import { CategoryType } from '@prisma/client'

import prisma from '@/utils/prisma'
import { CreateCategoryInput, UpdateCategoryBodyParams } from '@/http/modules/categories/categories.schema'

export async function createCategory(data: CreateCategoryInput) {
  const existingCategory = await prisma.tab_categories.findFirst({
    where: {
      name: data.name,
      type: data.type,
    },
  })

  if (existingCategory) throw new Error(`Já existe uma categoria '${data.name}' do tipo '${data.type}'.`)

  const category = await prisma.tab_categories.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      color: data.color,
      active: data.active,
    },
  })

  return category
}

export async function findCategoryById(categoryId: number) {
  const category = await prisma.tab_categories.findUnique({
    where: {
      category_id: categoryId,
    },
  })

  if (!category) throw new Error('Categoria não encontrada.')

  return category
}

export async function findCategories(filters: { type?: CategoryType; active?: boolean; page?: number; limit?: number }) {
  const { type, active, page = 1, limit = 10 } = filters
  const skip = (page - 1) * limit

  const where: any = {}

  if (type) where.type = type

  if (active !== undefined) where.active = active

  const [categories, total] = await Promise.all([
    prisma.tab_categories.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.tab_categories.count({
      where,
    }),
  ])

  return {
    categories,
    total,
  }
}

export async function updateCategory(categoryId: number, data: UpdateCategoryBodyParams) {
  const existingCategory = await findCategoryById(categoryId)

  if (data.name || data.type) {
    const duplicateCategory = await prisma.tab_categories.findFirst({
      where: {
        name: data.name || existingCategory.name,
        type: data.type || existingCategory.type,
        category_id: {
          not: categoryId,
        },
      },
    })

    if (duplicateCategory)
      throw new Error(
        `Já existe uma categoria '${data.name || existingCategory.name}' do tipo '${data.type || existingCategory.type}'.`,
      )
  }

  const category = await prisma.tab_categories.update({
    where: {
      category_id: categoryId,
    },
    data: {
      name: data.name,
      type: data.type,
      description: data.description,
      color: data.color,
      active: data.active,
    },
  })

  return category
}

export async function deleteCategory(categoryId: number) {
  await findCategoryById(categoryId)

  const [expenseCount, incomeCount] = await Promise.all([
    prisma.tab_expenses.count({
      where: {
        category_id: categoryId,
      },
    }),
    prisma.tab_incomes.count({
      where: {
        category_id: categoryId,
      },
    }),
  ])

  if (expenseCount > 0 || incomeCount > 0)
    throw new Error('Não é possível excluir a categoria pois ela está sendo utilizada em transações.')

  await prisma.tab_categories.delete({
    where: {
      category_id: categoryId,
    },
  })
}

export async function findCategoriesByType(type: CategoryType) {
  const categories = await prisma.tab_categories.findMany({
    where: {
      type,
      active: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return categories
}

export async function toggleCategoryStatus(categoryId: number) {
  const category = await findCategoryById(categoryId)

  const updatedCategory = await prisma.tab_categories.update({
    where: {
      category_id: categoryId,
    },
    data: {
      active: !category.active,
    },
  })

  return updatedCategory
}

export async function getCategoryStats(categoryId: number) {
  const category = await findCategoryById(categoryId)

  const [expenseCount, incomeCount, totalExpenses, totalIncomes] = await Promise.all([
    prisma.tab_expenses.count({
      where: {
        category_id: categoryId,
      },
    }),
    prisma.tab_incomes.count({
      where: {
        category_id: categoryId,
      },
    }),
    prisma.tab_expenses.aggregate({
      where: {
        category_id: categoryId,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.tab_incomes.aggregate({
      where: {
        category_id: categoryId,
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  return {
    category,
    stats: {
      expenseCount,
      incomeCount,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalIncomes: totalIncomes._sum.amount || 0,
      totalTransactions: expenseCount + incomeCount,
    },
  }
}
