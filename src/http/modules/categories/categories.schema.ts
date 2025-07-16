import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const categoryCore = {
  name: z
    .string({
      required_error: "O campo 'nome' é obrigatório.",
      invalid_type_error: "O campo 'nome' deve ser uma string.",
    })
    .min(1)
    .max(100),
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: "O campo 'tipo' é obrigatório.",
    invalid_type_error: "O campo 'tipo' deve ser 'INCOME' ou 'EXPENSE'.",
  }),
  description: z
    .string({
      invalid_type_error: "O campo 'descrição' deve ser uma string.",
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

const createCategorySchema = z.object({
  ...categoryCore,
})

const createCategoryResponseSchema = z.object({
  message: z.string(),
  data: z
    .object({
      category_id: z.number().int().positive(),
      ...categoryCore,
      created_at: z.date(),
      updated_at: z.date(),
    })
    .optional(),
})

const getCategoryResponseSchema = z.object({
  category_id: z.number().int().positive(),
  ...categoryCore,
  created_at: z.date(),
  updated_at: z.date(),
})

const listCategoriesResponseSchema = z.object({
  categories: z.array(getCategoryResponseSchema),
  total: z.number().int().nonnegative(),
})

const updateCategoryBodySchema = z
  .object({
    ...categoryCore,
  })
  .partial()

const categoryParamsSchema = z.object({
  category_id: z.string().regex(/^\d+$/, {
    message: 'O ID da categoria deve ser um número válido.',
  }),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryBodyParams = z.infer<typeof updateCategoryBodySchema>
export type CategoryParamsInput = z.infer<typeof categoryParamsSchema>

export const createCategorySchemaJson = zodToJsonSchema(createCategorySchema)
export const createCategoryResponseSchemaJson = zodToJsonSchema(createCategoryResponseSchema)
export const getCategoryResponseSchemaJson = zodToJsonSchema(getCategoryResponseSchema)
export const listCategoriesResponseSchemaJson = zodToJsonSchema(listCategoriesResponseSchema)
export const updateCategoryBodySchemaJson = zodToJsonSchema(updateCategoryBodySchema)
export const categoryParamsSchemaJson = zodToJsonSchema(categoryParamsSchema)
