import fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { version } from '../package.json'

import { env } from '@/env'
import { errorHandler } from '@/utils/errorHandler'
import { userRoutes } from '@/http/modules/user/user.route'

const envToLogger = {
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'dd/mm - HH:MM:ss',
      ignore: 'pid,hostname,log\\.domain\\.corp/foo',
    },
  },
}

export const app = fastify({
  logger: env.LOGGER === 'YES' ? envToLogger : false,
})

app.register(cors, {
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
})

// app.register(multipart)

app.register(fastifyRateLimit, {
  max: 60,
  timeWindow: '1 minute',
  global: true,
  keyGenerator: function (req) {
    const key = `${req.ip}:${req.originalUrl}`
    return key
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '2d',
  },
})

app.register(fastifyCookie)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Kontas Backend',
      description: 'API RESTFull para gerenciamento do app de Kontas.',
      version,
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
      },
    },
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/v1/docs',
  staticCSP: true,
  theme: {
    title: 'Kontas Backend',
    favicon: [
      {
        filename: 'favicon.png',
        rel: 'icon',
        sizes: '16x16',
        type: 'image/png',
        content: Buffer.from('iVBOR...', 'base64'),
      },
    ],
  },
})

app.register(userRoutes, { prefix: 'user' })

app.get('/', () => {
  return { version }
})

app.setErrorHandler(errorHandler)
