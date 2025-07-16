import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const userCore = {
  username: z
    .string({
      required_error: "O campo 'usuário' é obrigatório.",
      invalid_type_error: "O campo 'usuário' deve ser uma string.",
    })
    .min(3)
    .max(10),
  full_name: z
    .string({
      required_error: "O campo 'nome_completo' é obrigatório.",
      invalid_type_error: "O campo 'nome_completo' deve ser uma string.",
    })
    .min(3)
    .max(100),
  email: z.string().email().min(4).max(255),
  phone: z.string().regex(/^\d{11}$/, {
    message: "O campo 'telefone' deve conter exatamente 11 dígitos.",
  }),
  profile_picture: z.string().optional(),
}

const createUserSchema = z.object({
  ...userCore,
  password: z
    .string({
      required_error: "O campo 'senha' é obrigatório.",
      invalid_type_error: "O campo 'senha' deve ser uma string.",
    })
    .min(8)
    .max(64),
  user_type: z.literal('member').default('member'),
})

const createUserResponseSchema = z.object({
  message: z.string(),
  data: z
    .object({
      user_id: z.number().int().positive(),
      ...userCore,
      user_type: z.literal('member').default('member'),
    })
    .optional(),
})

const loginSchema = z.object({
  username: z
    .string({
      required_error: "O campo 'usuário' é obrigatório.",
      invalid_type_error: "O campo 'usuário' deve ser uma string.",
    })
    .min(5)
    .max(50),
  password: z
    .string({
      required_error: "O campo 'senha' é obrigatório.",
      invalid_type_error: "O campo 'senha' deve ser uma string.",
    })
    .min(8)
    .max(64),
})

const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    user_id: z.number().int().positive(),
    ...userCore,
    user_type: z.string(),
  }),
})

const profileResponseSchema = z.object({
  user_id: z.number().int().positive(),
  ...userCore,
  user_type: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
})

const updateUserBodySchema = z.object({
  ...userCore,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateUserBodyParams = z.infer<typeof updateUserBodySchema>

export const createUserSchemaJson = zodToJsonSchema(createUserSchema)
export const createUserResponseSchemaJson = zodToJsonSchema(createUserResponseSchema)
export const loginSchemaJson = zodToJsonSchema(loginSchema)
export const loginResponseSchemaJson = zodToJsonSchema(loginResponseSchema)
export const profileResponseSchemaJson = zodToJsonSchema(profileResponseSchema)
export const updateUserBodySchemaJson = zodToJsonSchema(updateUserBodySchema)
