export type ErrorMessages = {
  [key: string]: string
}

export const errorMessages: ErrorMessages = {
  minLength: 'O campo "{field}" precisa ter pelo menos {limit} caracteres.',
  maxLength: 'O campo "{field}" pode ter no máximo {limit} caracteres.',
  string: 'O campo "{field}" deve conter apenas texto.',
  number: 'O campo "{field}" deve conter um número válido.',
  email: 'Por favor, insira um email válido no campo "{field}".',
  regex: 'O valor preenchido no campo "{field}" não é válido.',
  required: 'O campo "{field}" é obrigatório e não pode ficar em branco.',
  type: 'O campo "{field}" precisa ser do tipo {expectedType}.',
  FST_ERR_CTP_EMPTY_JSON_BODY:
    'A requisição precisa incluir informações no formato "application/json".',
  FST_ERR_CTP_BODY_TOO_LARGE:
    'O corpo da requisição é muito grande. Por favor, reduza o tamanho do conteúdo enviado.',
}
