export const defaultErrorResponses = {
  404: {
    description:
      'O recurso solicitado não foi encontrado. Isso pode ocorrer se a URL estiver incorreta ou se o usuário solicitado não existir.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'O recurso solicitado não foi encontrado.',
            },
          },
          required: ['message'],
        },
      },
    },
  },
  500: {
    description: 'Erro interno do servidor. Ocorreu um problema inesperado ao processar a requisição.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erro do Servidor Interno!',
            },
            error: {
              type: 'object',
              additionalProperties: true,
            },
          },
          required: ['message'],
        },
      },
    },
  },
}
