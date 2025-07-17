import prisma from '@/utils/prisma'
import { CreateCardAccountInput, UpdateCardAccountBodyParams } from '@/http/modules/cards-accounts/cards-accounts.schema'

export async function createCardAccount(data: CreateCardAccountInput, user_id: number) {
  // Verificar se o usuário existe
  const userExists = await prisma.tab_users.findUnique({
    where: {
      user_id: data.user_id ?? user_id,
    },
  })

  if (!userExists) throw new Error('Usuário não encontrado.')

  // Verificar se já existe uma conta/cartão com o mesmo nome para o usuário
  const existingCardAccount = await prisma.tab_cards_accounts.findFirst({
    where: {
      user_id: data.user_id,
      name: data.name,
    },
  })

  if (existingCardAccount) throw new Error(`Já existe uma conta/cartão com o nome '${data.name}' para este usuário.`)

  const cardAccount = await prisma.tab_cards_accounts.create({
    data: {
      user_id: data.user_id ?? user_id,
      name: data.name,
      type: data.type,
      bank_name: data.bank_name,
      last_digits: data.last_digits,
      color: data.color,
      active: data.active,
    },
  })

  return cardAccount
}

export async function findCardAccountById(cardAccountId: number) {
  const cardAccount = await prisma.tab_cards_accounts.findUnique({
    where: {
      card_account_id: cardAccountId,
    },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          full_name: true,
        },
      },
    },
  })

  if (!cardAccount) throw new Error('Conta/cartão não encontrada.')

  return cardAccount
}

export async function findCardAccounts(filters: { type?: string; active?: boolean; user_id?: number; page?: number; limit?: number }) {
  const { type, active, user_id, page = 1, limit = 10 } = filters
  const skip = (page - 1) * limit

  const where: any = {}

  if (type) where.type = type
  if (active !== undefined) where.active = active
  if (user_id) where.user_id = user_id

  const [cardAccounts, total] = await Promise.all([
    prisma.tab_cards_accounts.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            full_name: true,
          },
        },
      },
    }),
    prisma.tab_cards_accounts.count({
      where,
    }),
  ])

  return {
    cardAccounts,
    total,
  }
}

export async function updateCardAccount(cardAccountId: number, data: UpdateCardAccountBodyParams) {
  const existingCardAccount = await findCardAccountById(cardAccountId)

  // Verificar se o usuário existe (se foi fornecido)
  if (data.user_id) {
    const userExists = await prisma.tab_users.findUnique({
      where: {
        user_id: data.user_id,
      },
    })

    if (!userExists) throw new Error('Usuário não encontrado.')
  }

  // Verificar duplicata de nome para o mesmo usuário
  if (data.name) {
    const duplicateCardAccount = await prisma.tab_cards_accounts.findFirst({
      where: {
        user_id: data.user_id || existingCardAccount.user_id,
        name: data.name,
        card_account_id: {
          not: cardAccountId,
        },
      },
    })

    if (duplicateCardAccount) throw new Error(`Já existe uma conta/cartão com o nome '${data.name}' para este usuário.`)
  }

  const cardAccount = await prisma.tab_cards_accounts.update({
    where: {
      card_account_id: cardAccountId,
    },
    data: {
      user_id: data.user_id,
      name: data.name,
      type: data.type,
      bank_name: data.bank_name,
      last_digits: data.last_digits,
      color: data.color,
      active: data.active,
    },
  })

  return cardAccount
}

export async function deleteCardAccount(cardAccountId: number) {
  await findCardAccountById(cardAccountId)

  const [expenseCount, incomeCount] = await Promise.all([
    prisma.tab_expenses.count({
      where: {
        card_account_id: cardAccountId,
      },
    }),
    prisma.tab_incomes.count({
      where: {
        card_account_id: cardAccountId,
      },
    }),
  ])

  if (expenseCount > 0 || incomeCount > 0)
    throw new Error('Não é possível excluir a conta/cartão pois ela está sendo utilizada em transações.')

  await prisma.tab_cards_accounts.delete({
    where: {
      card_account_id: cardAccountId,
    },
  })
}

export async function findCardAccountsByUser(userId: number) {
  const userExists = await prisma.tab_users.findUnique({
    where: {
      user_id: userId,
    },
  })

  if (!userExists) throw new Error('Usuário não encontrado.')

  const cardAccounts = await prisma.tab_cards_accounts.findMany({
    where: {
      user_id: userId,
      active: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return cardAccounts
}

export async function findCardAccountsByType(type: string) {
  const cardAccounts = await prisma.tab_cards_accounts.findMany({
    where: {
      type,
      active: true,
    },
    orderBy: {
      name: 'asc',
    },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          full_name: true,
        },
      },
    },
  })

  return cardAccounts
}

export async function toggleCardAccountStatus(cardAccountId: number) {
  const cardAccount = await findCardAccountById(cardAccountId)

  const updatedCardAccount = await prisma.tab_cards_accounts.update({
    where: {
      card_account_id: cardAccountId,
    },
    data: {
      active: !cardAccount.active,
    },
  })

  return updatedCardAccount
}

export async function getCardAccountStats(cardAccountId: number) {
  const cardAccount = await findCardAccountById(cardAccountId)

  const [expenseCount, incomeCount, totalExpenses, totalIncomes] = await Promise.all([
    prisma.tab_expenses.count({
      where: {
        card_account_id: cardAccountId,
      },
    }),
    prisma.tab_incomes.count({
      where: {
        card_account_id: cardAccountId,
      },
    }),
    prisma.tab_expenses.aggregate({
      where: {
        card_account_id: cardAccountId,
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.tab_incomes.aggregate({
      where: {
        card_account_id: cardAccountId,
      },
      _sum: {
        amount: true,
      },
    }),
  ])

  return {
    cardAccount,
    stats: {
      expenseCount,
      incomeCount,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalIncomes: totalIncomes._sum.amount || 0,
      totalTransactions: expenseCount + incomeCount,
    },
  }
}

export async function getUserCardAccountsSummary(userId: number) {
  const userExists = await prisma.tab_users.findUnique({
    where: {
      user_id: userId,
    },
  })

  if (!userExists) throw new Error('Usuário não encontrado.')

  const cardAccounts = await prisma.tab_cards_accounts.findMany({
    where: {
      user_id: userId,
    },
    include: {
      _count: {
        select: {
          expenses: true,
          incomes: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return cardAccounts
}
