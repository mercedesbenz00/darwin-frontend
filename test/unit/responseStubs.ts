import { ErrorWithMessage, ParsedValidationError } from '@/utils'

export const backendUnauthenticatedError = { response: { status: 401 } }
export const windUnauthenticatedError = { response: { status: 401 } }
export const windUnauthorizedError = { response: { status: 403 } }
export const windPaymentRequiredError = { response: { status: 402 } }
export const windServicesDownError = { response: { status: 503 } }

export const fakeError: ErrorWithMessage | ParsedValidationError = {
  message: 'Fake Error',
  isValidationError: false
}
