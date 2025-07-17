import { Decimal } from '@prisma/client/runtime/library'
import prisma from '@/utils/prisma'
import { CreateExpenseInput, UpdateExpenseBodyParams } from '@/http/modules/expenses/expenses.schema'

export async function createExpense(data: CreateExpenseInput) {
  // Verificar se a categoria existe e é do tipo EXPENSE
  const category = await prisma.tab_categories.findUnique({
    where: {
      category_id: data.category_id,
    },
  })

  if (!category) throw new Error('Categoria não encontrada.')
  if (category.type !== 'EXPENSE') throw new Error('A categoria deve ser do tipo EXPENSE.')
  if (!category.active) throw new Error('A categoria está inativa.')

  // Verificar se a conta/cartão existe e está ativa
  const cardAccount = await prisma.tab_cards_accounts.findUnique({
    where: {
      card_account_id: data.card_account_id,
    },
  })

  if (!cardAccount) throw new Error('Conta/cartão não encontrada.')
  if (!cardAccount.active) throw new Error('A conta/cartão está inativa.')

  // Verificar se todos os usuários responsáveis existem
  const userIds = data.expense_owners.map((owner) => owner.user_id)
  const users = await prisma.tab_users.findMany({
    where: {
      user_id: {
        in: userIds,
      },
    },
  })

  if (users.length !== userIds.length) throw new Error('Um ou mais usuários responsáveis não foram encontrados.')

  // Criar a despesa com os responsáveis
  const expense = await prisma.tab_expenses.create({
    data: {
      name: data.name,
      amount: new Decimal(data.amount),
      category_id: data.category_id,
      card_account_id: data.card_account_id,
      annotation: data.annotation,
      expense_date: new Date(data.expense_date),
      expense_owners: {
        create: data.expense_owners.map((owner) => ({
          user_id: owner.user_id,
          percentage: new Decimal(owner.percentage || 100),
        })),
      },
    },
    include: {
      expense_owners: {
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              full_name: true,
            },
          },
        },
      },
    },
  })

  return expense
}

export async function findExpenseById(expenseId: number) {
  const expense = await prisma.tab_expenses.findUnique({
    where: {
      expense_id: expenseId,
    },
    include: {
      category: {
        select: {
          category_id: true,
          name: true,
          type: true,
          color: true,
        },
      },
      card_account: {
        select: {
          card_account_id: true,
          name: true,
          type: true,
          bank_name: true,
          last_digits: true,
          color: true,
        },
      },
      expense_owners: {
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          percentage: 'desc',
        },
      },
    },
  })

  if (!expense) throw new Error('Despesa não encontrada.')

  return expense
}

export async function findExpenses(filters: {
  category_id?: number
  card_account_id?: number
  user_id?: number
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  page?: number
  limit?: number
}) {
  const { category_id, card_account_id, user_id, start_date, end_date, min_amount, max_amount, page = 1, limit = 10 } = filters
  const skip = (page - 1) * limit

  const where: any = {}

  if (category_id) where.category_id = category_id
  if (card_account_id) where.card_account_id = card_account_id

  if (user_id) {
    where.expense_owners = {
      some: {
        user_id,
      },
    }
  }

  if (start_date || end_date) {
    where.expense_date = {}
    if (start_date) where.expense_date.gte = new Date(start_date)
    if (end_date) where.expense_date.lte = new Date(end_date)
  }

  if (min_amount || max_amount) {
    where.amount = {}
    if (min_amount) where.amount.gte = new Decimal(min_amount)
    if (max_amount) where.amount.lte = new Decimal(max_amount)
  }

  const [expenses, total, totalAmountResult] = await Promise.all([
    prisma.tab_expenses.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        expense_date: 'desc',
      },
      include: {
        category: {
          select: {
            category_id: true,
            name: true,
            type: true,
            color: true,
          },
        },
        card_account: {
          select: {
            card_account_id: true,
            name: true,
            type: true,
            bank_name: true,
            last_digits: true,
            color: true,
          },
        },
        expense_owners: {
          include: {
            user: {
              select: {
                user_id: true,
                username: true,
                full_name: true,
                profile_picture: true,
              },
            },
          },
          orderBy: {
            percentage: 'desc',
          },
        },
      },
    }),
    prisma.tab_expenses.count({
      where,
    }),
    prisma.tab_expenses.aggregate({
      where,
      _sum: {
        amount: true,
      },
    }),
  ])

  return {
    expenses,
    total,
    totalAmount: totalAmountResult._sum.amount || 0,
  }
}

export async function updateExpense(expenseId: number, data: UpdateExpenseBodyParams) {
  const existingExpense = await findExpenseById(expenseId)

  // Verificar categoria se fornecida
  if (data.category_id) {
    const category = await prisma.tab_categories.findUnique({
      where: {
        category_id: data.category_id,
      },
    })

    if (!category) throw new Error('Categoria não encontrada.')
    if (category.type !== 'EXPENSE') throw new Error('A categoria deve ser do tipo EXPENSE.')
    if (!category.active) throw new Error('A categoria está inativa.')
  }

  // Verificar conta/cartão se fornecida
  if (data.card_account_id) {
    const cardAccount = await prisma.tab_cards_accounts.findUnique({
      where: {
        card_account_id: data.card_account_id,
      },
    })

    if (!cardAccount) throw new Error('Conta/cartão não encontrada.')
    if (!cardAccount.active) throw new Error('A conta/cartão está inativa.')
  }

  // Verificar usuários responsáveis se fornecidos
  if (data.expense_owners) {
    const userIds = data.expense_owners.map((owner) => owner.user_id)
    const users = await prisma.tab_users.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
    })

    if (users.length !== userIds.length) {
      throw new Error('Um ou mais usuários responsáveis não foram encontrados.')
    }
  }

  // Atualizar a despesa
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.amount !== undefined) updateData.amount = new Decimal(data.amount)
  if (data.category_id !== undefined) updateData.category_id = data.category_id
  if (data.card_account_id !== undefined) updateData.card_account_id = data.card_account_id
  if (data.annotation !== undefined) updateData.annotation = data.annotation
  if (data.expense_date !== undefined) updateData.expense_date = new Date(data.expense_date)

  // Se há novos responsáveis, recriar todos
  if (data.expense_owners) {
    // Remover responsáveis existentes
    await prisma.tab_expense_owners.deleteMany({
      where: {
        expense_id: expenseId,
      },
    })

    // Criar novos responsáveis
    updateData.expense_owners = {
      create: data.expense_owners.map((owner) => ({
        user_id: owner.user_id,
        percentage: new Decimal(owner.percentage || 100),
      })),
    }
  }

  const expense = await prisma.tab_expenses.update({
    where: {
      expense_id: expenseId,
    },
    data: updateData,
    include: {
      category: {
        select: {
          category_id: true,
          name: true,
          type: true,
          color: true,
        },
      },
      card_account: {
        select: {
          card_account_id: true,
          name: true,
          type: true,
          bank_name: true,
          last_digits: true,
          color: true,
        },
      },
      expense_owners: {
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
        orderBy: {
          percentage: 'desc',
        },
      },
    },
  })

  return expense
}

export async function deleteExpense(expenseId: number) {
  await findExpenseById(expenseId)

  // Os responsáveis são deletados automaticamente por causa do onDelete: Cascade
  await prisma.tab_expenses.delete({
    where: {
      expense_id: expenseId,
    },
  })
}

export async function findExpensesByUser(
  userId: number,
  filters: {
    start_date?: string
    end_date?: string
    category_id?: number
    page?: number
    limit?: number
  },
) {
  const userExists = await prisma.tab_users.findUnique({
    where: {
      user_id: userId,
    },
  })

  if (!userExists) throw new Error('Usuário não encontrado.')

  return findExpenses({
    user_id: userId,
    ...filters,
  })
}

export async function findExpensesByCategory(categoryId: number) {
  const category = await prisma.tab_categories.findUnique({
    where: {
      category_id: categoryId,
    },
  })

  if (!category) throw new Error('Categoria não encontrada.')
  if (category.type !== 'EXPENSE') throw new Error('A categoria deve ser do tipo EXPENSE.')

  const expenses = await prisma.tab_expenses.findMany({
    where: {
      category_id: categoryId,
    },
    orderBy: {
      expense_date: 'desc',
    },
    include: {
      card_account: {
        select: {
          card_account_id: true,
          name: true,
          type: true,
          color: true,
        },
      },
      expense_owners: {
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              full_name: true,
            },
          },
        },
        orderBy: {
          percentage: 'desc',
        },
      },
    },
  })

  return expenses
}

export async function getExpenseStats(expenseId: number) {
  const expense = await findExpenseById(expenseId)

  const stats = {
    totalOwners: expense.expense_owners.length,
    individualAmounts: expense.expense_owners.map((owner) => ({
      user: owner.user,
      percentage: Number(owner.percentage),
      amount: Number(expense.amount) * (Number(owner.percentage) / 100),
    })),
  }

  return {
    expense,
    stats,
  }
}

export async function getUserExpensesSummary(
  userId: number,
  filters: {
    start_date?: string
    end_date?: string
    category_id?: number
  },
) {
  const userExists = await prisma.tab_users.findUnique({
    where: {
      user_id: userId,
    },
  })

  if (!userExists) throw new Error('Usuário não encontrado.')

  const where: any = {
    expense_owners: {
      some: {
        user_id: userId,
      },
    },
  }

  if (filters.start_date || filters.end_date) {
    where.expense_date = {}
    if (filters.start_date) where.expense_date.gte = new Date(filters.start_date)
    if (filters.end_date) where.expense_date.lte = new Date(filters.end_date)
  }

  if (filters.category_id) where.category_id = filters.category_id

  const [totalExpenses, totalAmount, expensesByCategory] = await Promise.all([
    prisma.tab_expenses.count({
      where,
    }),
    prisma.tab_expenses.aggregate({
      where,
      _sum: {
        amount: true,
      },
    }),
    prisma.tab_expenses.groupBy({
      by: ['category_id'],
      where,
      _count: {
        expense_id: true,
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  const categoriesWithExpenses = await prisma.tab_categories.findMany({
    where: {
      category_id: {
        in: expensesByCategory.map((item) => item.category_id),
      },
    },
    select: {
      category_id: true,
      name: true,
      color: true,
    },
  })

  const expensesByCategories = expensesByCategory.map((item) => {
    const category = categoriesWithExpenses.find((cat) => cat.category_id === item.category_id)
    return {
      category,
      count: item._count.expense_id,
      totalAmount: item._sum.amount || 0,
    }
  })

  return {
    user: userExists,
    summary: {
      totalExpenses,
      totalAmount: totalAmount._sum.amount || 0,
      expensesByCategories,
    },
  }
}
