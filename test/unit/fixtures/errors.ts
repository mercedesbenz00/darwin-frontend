import { ErrorWithMessage } from '@/utils'
import { ErrorCodes, errorsByExplicitCode } from '@/utils/error/errors'

export const outOfSubscribedStorageError: ErrorWithMessage = {
  code: ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE,
  backendMessage: null,
  detail: null,
  message: '',
  status: 429
}

export const itemAlreadyInWorkflowError: ErrorWithMessage = {
  code: ErrorCodes.ALREADY_IN_WORKFLOW,
  backendMessage: null,
  detail: null,
  message: errorsByExplicitCode[ErrorCodes.ALREADY_IN_WORKFLOW],
  status: 422
}
