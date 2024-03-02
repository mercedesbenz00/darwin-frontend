import { ErrorWithMessage, ParsedError } from '@/utils'

export const buildParsedError = (params: Partial<ErrorWithMessage>): ParsedError => ({
  error: {
    backendMessage: '',
    code: null,
    detail: null,
    message: '',
    status: null,
    ...params
  }
})
