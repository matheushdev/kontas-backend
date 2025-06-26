import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV !== undefined)
  process.env.NODE_ENV = process.env.NODE_ENV.replace(/\s/g, '')

if (process.env.NODE_ENV === 'development') {
  config({ path: '.env.development' })
} else {
  config()
}

const envSchema = z.object({
  LOGGER: z.enum(['YES', 'NO']).default('YES'),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Variáveis de ambiente inválidas.', _env.error.format())

  throw new Error('Variáveis de ambiente inválidas.')
}

export const env = _env.data
