import { app } from '@/app'
import { env } from '@/env'

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then((address) => {
    console.info(
      `Server listening at ${address} - Mode: ${process.env.NODE_ENV?.toUpperCase().replace(/\s/g, '')}!`,
    )
    app.log.info(
      `Server listening at ${address} - Mode: ${process.env.NODE_ENV?.toUpperCase().replace(/\s/g, '')}!`,
    )
  })
  .catch((err: any) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
