import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const expenseCore = {
  name: z
    .string({
      required_error: "O campo 'nome' é obrigatório.",
      invalid_type_error: "O campo 'nome' deve ser uma string.",
    })
    .min(1)
    .max(255),
  amount: z
    .number({
      required_error: "O campo 'valor' é obrigatório.",
      invalid_type_error: "O campo 'valor' deve ser um número.",
    })
    .positive({
      message: 'O valor deve ser maior que zero.',
    })
    .multipleOf(0.01, {
      message: 'O valor deve ter no máximo 2 casas decimais.',
    }),
  category_id: z
    .number({
      required_error: "O campo 'category_id' é obrigatório.",
      invalid_type_error: "O campo 'category_id' deve ser um número.",
    })
    .int()
    .positive(),
  card_account_id: z
    .number({
      required_error: "O campo 'card_account_id' é obrigatório.",
      invalid_type_error: "O campo 'card_account_id' deve ser um número.",
    })
    .int()
    .positive(),
  annotation: z
    .string({
      invalid_type_error: "O campo 'anotação' deve ser uma string.",
    })
    .optional(),
  expense_date: z
    .string({
      required_error: "O campo 'data da despesa' é obrigatório.",
      invalid_type_error: "O campo 'data da despesa' deve ser uma data válida.",
    })
    .datetime({
      message: "O campo 'data da despesa' deve estar no formato ISO 8601.",
    })
    .or(z.date()),
}

const expenseOwnerCore = {
  user_id: z
    .number({
      required_error: "O campo 'user_id' é obrigatório.",
      invalid_type_error: "O campo 'user_id' deve ser um número.",
    })
    .int()
    .positive(),
  percentage: z
    .number({
      invalid_type_error: "O campo 'percentual' deve ser um número.",
    })
    .min(0.01, {
      message: 'O percentual deve ser maior que 0.',
    })
    .max(100, {
      message: 'O percentual deve ser menor ou igual a 100.',
    })
    .multipleOf(0.01, {
      message: 'O percentual deve ter no máximo 2 casas decimais.',
    })
    .default(100),
}

const createExpenseSchema = z.object({
  ...expenseCore,
  expense_owners: z
    .array(
      z.object({
        ...expenseOwnerCore,
      }),
    )
    .min(1, {
      message: 'Deve haver pelo menos um responsável pela despesa.',
    })
    .refine(
      (owners) => {
        const totalPercentage = owners.reduce((sum, owner) => sum + (owner.percentage || 100), 0)
        return totalPercentage === 100
      },
      {
        message: 'A soma dos percentuais deve ser igual a 100%.',
      },
    )
    .refine(
      (owners) => {
        const userIds = owners.map((owner) => owner.user_id)
        return new Set(userIds).size === userIds.length
      },
      {
        message: 'Não é possível ter o mesmo usuário como responsável mais de uma vez.',
      },
    ),
})

const createExpenseResponseSchema = z.object({
  message: z.string(),
  data: z
    .object({
      expense_id: z.number().int().positive(),
      ...expenseCore,
      created_at: z.date(),
      updated_at: z.date(),
      expense_owners: z.array(
        z.object({
          expense_owner_id: z.number().int().positive(),
          expense_id: z.number().int().positive(),
          user_id: z.number().int().positive(),
          percentage: z.number(),
          created_at: z.date(),
          user: z
            .object({
              user_id: z.number().int().positive(),
              username: z.string(),
              full_name: z.string(),
            })
            .optional(),
        }),
      ),
    })
    .optional(),
})

const getExpenseResponseSchema = z.object({
  expense_id: z.number().int().positive(),
  ...expenseCore,
  created_at: z.date(),
  updated_at: z.date(),
  category: z.object({
    category_id: z.number().int().positive(),
    name: z.string(),
    type: z.enum(['INCOME', 'EXPENSE']),
    color: z.string().optional(),
  }),
  card_account: z.object({
    card_account_id: z.number().int().positive(),
    name: z.string(),
    type: z.string(),
    bank_name: z.string().optional(),
    last_digits: z.string().optional(),
    color: z.string().optional(),
  }),
  expense_owners: z.array(
    z.object({
      expense_owner_id: z.number().int().positive(),
      user_id: z.number().int().positive(),
      percentage: z.number(),
      user: z.object({
        user_id: z.number().int().positive(),
        username: z.string(),
        full_name: z.string(),
        profile_picture: z.string().optional(),
      }),
    }),
  ),
})

const listExpensesResponseSchema = z.object({
  expenses: z.array(getExpenseResponseSchema),
  total: z.number().int().nonnegative(),
  totalAmount: z.number().optional(),
})

const updateExpenseBodySchema = z
  .object({
    ...expenseCore,
    expense_owners: z
      .array(
        z.object({
          ...expenseOwnerCore,
        }),
      )
      .min(1, {
        message: 'Deve haver pelo menos um responsável pela despesa.',
      })
      .refine(
        (owners) => {
          const totalPercentage = owners.reduce((sum, owner) => sum + (owner.percentage || 100), 0)
          return totalPercentage === 100
        },
        {
          message: 'A soma dos percentuais deve ser igual a 100%.',
        },
      )
      .refine(
        (owners) => {
          const userIds = owners.map((owner) => owner.user_id)
          return new Set(userIds).size === userIds.length
        },
        {
          message: 'Não é possível ter o mesmo usuário como responsável mais de uma vez.',
        },
      )
      .optional(),
  })
  .partial()

const expenseParamsSchema = z.object({
  expense_id: z.string().regex(/^\d+$/, {
    message: 'O ID da despesa deve ser um número válido.',
  }),
})

const expensesQuerySchema = z.object({
  category_id: z
    .string()
    .regex(/^\d+$/, {
      message: 'O ID da categoria deve ser um número válido.',
    })
    .optional(),
  card_account_id: z
    .string()
    .regex(/^\d+$/, {
      message: 'O ID da conta/cartão deve ser um número válido.',
    })
    .optional(),
  user_id: z
    .string()
    .regex(/^\d+$/, {
      message: 'O ID do usuário deve ser um número válido.',
    })
    .optional(),
  start_date: z
    .string()
    .datetime({
      message: 'A data inicial deve estar no formato ISO 8601.',
    })
    .optional(),
  end_date: z
    .string()
    .datetime({
      message: 'A data final deve estar no formato ISO 8601.',
    })
    .optional(),
  min_amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'O valor mínimo deve ser um número válido com até 2 casas decimais.',
    })
    .optional(),
  max_amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'O valor máximo deve ser um número válido com até 2 casas decimais.',
    })
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, {
      message: 'A página deve ser um número válido.',
    })
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, {
      message: 'O limite deve ser um número válido.',
    })
    .optional(),
})

const userExpensesParamsSchema = z.object({
  user_id: z.string().regex(/^\d+$/, {
    message: 'O ID do usuário deve ser um número válido.',
  }),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseBodyParams = z.infer<typeof updateExpenseBodySchema>
export type ExpenseParamsInput = z.infer<typeof expenseParamsSchema>
export type ExpensesQueryInput = z.infer<typeof expensesQuerySchema>
export type UserExpensesParamsInput = z.infer<typeof userExpensesParamsSchema>

export const createExpenseSchemaJson = zodToJsonSchema(createExpenseSchema)
export const createExpenseResponseSchemaJson = zodToJsonSchema(createExpenseResponseSchema)
export const getExpenseResponseSchemaJson = zodToJsonSchema(getExpenseResponseSchema)
export const listExpensesResponseSchemaJson = zodToJsonSchema(listExpensesResponseSchema)
export const updateExpenseBodySchemaJson = zodToJsonSchema(updateExpenseBodySchema)
export const expenseParamsSchemaJson = zodToJsonSchema(expenseParamsSchema)
export const expensesQuerySchemaJson = zodToJsonSchema(expensesQuerySchema)
export const userExpensesParamsSchemaJson = zodToJsonSchema(userExpensesParamsSchema)
