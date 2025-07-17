import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const cardAccountCore = {
  user_id: z
    .number({
      required_error: "O campo 'user_id' é obrigatório.",
      invalid_type_error: "O campo 'user_id' deve ser um número.",
    })
    .int()
    .positive()
    .optional(),
  name: z
    .string({
      required_error: "O campo 'nome' é obrigatório.",
      invalid_type_error: "O campo 'nome' deve ser uma string.",
    })
    .min(1)
    .max(100),
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'PIX', 'CASH'], {
    required_error: "O campo 'tipo' é obrigatório.",
    invalid_type_error: "O campo 'tipo' deve ser 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'PIX' ou 'CASH'.",
  }),
  bank_name: z
    .string({
      invalid_type_error: "O campo 'nome do banco' deve ser uma string.",
    })
    .max(100)
    .optional(),
  last_digits: z
    .string({
      invalid_type_error: "O campo 'últimos dígitos' deve ser uma string.",
    })
    .max(4)
    .regex(/^\d{4}$/, {
      message: "O campo 'últimos dígitos' deve conter exatamente 4 dígitos.",
    })
    .optional(),
  color: z
    .string({
      invalid_type_error: "O campo 'cor' deve ser uma string.",
    })
    .regex(/^#[0-9A-Fa-f]{6}$/, {
      message: "O campo 'cor' deve ser uma cor hexadecimal válida (ex: #FF5733).",
    })
    .optional(),
  active: z.boolean().default(true),
}

const createCardAccountSchema = z.object({
  ...cardAccountCore,
})

const createCardAccountResponseSchema = z.object({
  message: z.string(),
  data: z
    .object({
      card_account_id: z.number().int().positive(),
      ...cardAccountCore,
      created_at: z.date(),
      updated_at: z.date(),
    })
    .optional(),
})

const getCardAccountResponseSchema = z.object({
  card_account_id: z.number().int().positive(),
  ...cardAccountCore,
  created_at: z.date(),
  updated_at: z.date(),
})

const listCardAccountsResponseSchema = z.object({
  cardAccounts: z.array(getCardAccountResponseSchema),
  total: z.number().int().nonnegative(),
})

const updateCardAccountBodySchema = z
  .object({
    ...cardAccountCore,
  })
  .partial()

const cardAccountParamsSchema = z.object({
  card_account_id: z.string().regex(/^\d+$/, {
    message: 'O ID da conta/cartão deve ser um número válido.',
  }),
})

// Schemas para filtros específicos
const cardAccountsByUserParamsSchema = z.object({
  user_id: z.string().regex(/^\d+$/, {
    message: 'O ID do usuário deve ser um número válido.',
  }),
})

const cardAccountsQuerySchema = z.object({
  type: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_ACCOUNT', 'PIX', 'CASH']).optional(),
  active: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  user_id: z
    .string()
    .regex(/^\d+$/, {
      message: 'O ID do usuário deve ser um número válido.',
    })
    .optional(),
})

export type CreateCardAccountInput = z.infer<typeof createCardAccountSchema>
export type UpdateCardAccountBodyParams = z.infer<typeof updateCardAccountBodySchema>
export type CardAccountParamsInput = z.infer<typeof cardAccountParamsSchema>
export type CardAccountsByUserParamsInput = z.infer<typeof cardAccountsByUserParamsSchema>
export type CardAccountsQueryInput = z.infer<typeof cardAccountsQuerySchema>

export const createCardAccountSchemaJson = zodToJsonSchema(createCardAccountSchema)
export const createCardAccountResponseSchemaJson = zodToJsonSchema(createCardAccountResponseSchema)
export const getCardAccountResponseSchemaJson = zodToJsonSchema(getCardAccountResponseSchema)
export const listCardAccountsResponseSchemaJson = zodToJsonSchema(listCardAccountsResponseSchema)
export const updateCardAccountBodySchemaJson = zodToJsonSchema(updateCardAccountBodySchema)
export const cardAccountParamsSchemaJson = zodToJsonSchema(cardAccountParamsSchema)
export const cardAccountsByUserParamsSchemaJson = zodToJsonSchema(cardAccountsByUserParamsSchema)
export const cardAccountsQuerySchemaJson = zodToJsonSchema(cardAccountsQuerySchema)
