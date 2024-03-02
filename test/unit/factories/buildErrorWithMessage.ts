import { ErrorWithMessage } from '@/utils'

type Params = Partial<ErrorWithMessage>

export const buildErrorWithMessage = (params: Params = {}): ErrorWithMessage => ({
  backendMessage: null,
  code: null,
  detail: null,
  message: 'error message',
  status: 400,
  ...params
})
