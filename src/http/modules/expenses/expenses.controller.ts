import { FastifyRequest, FastifyReply } from 'fastify'

import {
  CreateExpenseInput,
  UpdateExpenseBodyParams,
  ExpenseParamsInput,
  ExpensesQueryInput,
  UserExpensesParamsInput,
} from '@/http/modules/expenses/expenses.schema'
import {
  createExpense,
  findExpenseById,
  findExpenses,
  updateExpense,
  deleteExpense,
  findExpensesByUser,
  findExpensesByCategory,
  getExpenseStats,
  getUserExpensesSummary,
} from '@/http/modules/expenses/expenses.service'

export async function createExpenseHandler(
  request: FastifyRequest<{
    Body: CreateExpenseInput
  }>,
  reply: FastifyReply,
) {
  const expense = await createExpense(request.body)
  return reply.code(201).send({
    message: `Despesa '${expense.name}' foi criada com sucesso!`,
    data: expense,
  })
}

export async function getExpenseHandler(
  request: FastifyRequest<{
    Params: ExpenseParamsInput
  }>,
  reply: FastifyReply,
) {
  const { expense_id } = request.params
  const expense = await findExpenseById(parseInt(expense_id))
  return reply.code(200).send(expense)
}

export async function listExpensesHandler(
  request: FastifyRequest<{
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
  }>,
  reply: FastifyReply,
) {
  const {
    category_id,
    card_account_id,
    user_id,
    start_date,
    end_date,
    min_amount,
    max_amount,
    page = '1',
    limit = '10',
  } = request.query

  const filters = {
    category_id: category_id ? parseInt(category_id) : undefined,
    card_account_id: card_account_id ? parseInt(card_account_id) : undefined,
    user_id: user_id ? parseInt(user_id) : undefined,
    start_date,
    end_date,
    min_amount: min_amount ? parseFloat(min_amount) : undefined,
    max_amount: max_amount ? parseFloat(max_amount) : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const { expenses, total, totalAmount } = await findExpenses(filters)

  return reply.code(200).send({
    expenses,
    total,
    totalAmount,
    page: filters.page,
    limit: filters.limit,
  })
}

export async function updateExpenseHandler(
  request: FastifyRequest<{
    Params: ExpenseParamsInput
    Body: UpdateExpenseBodyParams
  }>,
  reply: FastifyReply,
) {
  const { expense_id } = request.params
  const expense = await updateExpense(parseInt(expense_id), request.body)
  return reply.code(200).send({
    message: `Despesa '${expense.name}' foi atualizada com sucesso!`,
    data: expense,
  })
}

export async function deleteExpenseHandler(
  request: FastifyRequest<{
    Params: ExpenseParamsInput
  }>,
  reply: FastifyReply,
) {
  const { expense_id } = request.params
  await deleteExpense(parseInt(expense_id))
  return reply.code(200).send({
    message: 'Despesa foi excluída com sucesso!',
  })
}

export async function listExpensesByUserHandler(
  request: FastifyRequest<{
    Params: UserExpensesParamsInput
    Querystring: {
      start_date?: string
      end_date?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>,
  reply: FastifyReply,
) {
  const { user_id } = request.params
  const { start_date, end_date, category_id, page = '1', limit = '10' } = request.query

  const filters = {
    start_date,
    end_date,
    category_id: category_id ? parseInt(category_id) : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const { expenses, total, totalAmount } = await findExpensesByUser(parseInt(user_id), filters)

  return reply.code(200).send({
    expenses,
    total,
    totalAmount,
    page: filters.page,
    limit: filters.limit,
  })
}

export async function listExpensesByCategoryHandler(
  request: FastifyRequest<{
    Params: {
      category_id: string
    }
  }>,
  reply: FastifyReply,
) {
  const { category_id } = request.params
  const expenses = await findExpensesByCategory(parseInt(category_id))
  return reply.code(200).send(expenses)
}

export async function getExpenseStatsHandler(
  request: FastifyRequest<{
    Params: ExpenseParamsInput
  }>,
  reply: FastifyReply,
) {
  const { expense_id } = request.params
  const result = await getExpenseStats(parseInt(expense_id))
  return reply.code(200).send(result)
}

export async function getUserExpensesSummaryHandler(
  request: FastifyRequest<{
    Params: UserExpensesParamsInput
    Querystring: {
      start_date?: string
      end_date?: string
      category_id?: string
    }
  }>,
  reply: FastifyReply,
) {
  const { user_id } = request.params
  const { start_date, end_date, category_id } = request.query

  const filters = {
    start_date,
    end_date,
    category_id: category_id ? parseInt(category_id) : undefined,
  }

  const result = await getUserExpensesSummary(parseInt(user_id), filters)
  return reply.code(200).send(result)
}

export async function getExpensesByDateRangeHandler(
  request: FastifyRequest<{
    Querystring: {
      start_date: string
      end_date: string
      user_id?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>,
  reply: FastifyReply,
) {
  const { start_date, end_date, user_id, category_id, page = '1', limit = '10' } = request.query

  const filters = {
    start_date,
    end_date,
    user_id: user_id ? parseInt(user_id) : undefined,
    category_id: category_id ? parseInt(category_id) : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const { expenses, total, totalAmount } = await findExpenses(filters)

  return reply.code(200).send({
    expenses,
    total,
    totalAmount,
    dateRange: {
      start_date,
      end_date,
    },
    page: filters.page,
    limit: filters.limit,
  })
}

export async function getExpensesByAmountRangeHandler(
  request: FastifyRequest<{
    Querystring: {
      min_amount: string
      max_amount: string
      user_id?: string
      category_id?: string
      page?: string
      limit?: string
    }
  }>,
  reply: FastifyReply,
) {
  const { min_amount, max_amount, user_id, category_id, page = '1', limit = '10' } = request.query

  const filters = {
    min_amount: parseFloat(min_amount),
    max_amount: parseFloat(max_amount),
    user_id: user_id ? parseInt(user_id) : undefined,
    category_id: category_id ? parseInt(category_id) : undefined,
    page: parseInt(page),
    limit: parseInt(limit),
  }

  const { expenses, total, totalAmount } = await findExpenses(filters)

  return reply.code(200).send({
    expenses,
    total,
    totalAmount,
    amountRange: {
      min_amount: filters.min_amount,
      max_amount: filters.max_amount,
    },
    page: filters.page,
    limit: filters.limit,
  })
}
