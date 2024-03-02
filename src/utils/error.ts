import { mapKeys, mapValues, camelCase, hasIn, upperFirst } from 'lodash'
import { Store } from 'vuex'

import { RootState, ValidationError } from '@/store/types'

import { DEFAULT_ERROR, errorsByCode, errorMessages } from './error/errors'
import {
  BackendError,
  ErrorMessageGroup,
  ErrorResponse,
  ErrorWithMessage,
  ParsedError,
  ParsedValidationError
} from './error/types'

/**
 * Construct a local error using the specified format.
 *
 * The code parameter is required and determines the message.
 *
 * The message parameter is optional and overrides the default message determined by code.
 */
export const constructError = (code: keyof typeof errorsByCode, message?: string): ParsedError => {
  message = message || errorsByCode[code]

  if (!message) {
    throw new Error(`An unexpected constructError call was made . Code: ${code}`)
  }

  const error: ErrorWithMessage = {
    backendMessage: null,
    code,
    detail: null,
    message,
    status: null
  }

  return { error }
}

/**
 * Determines if the payload is an error payload returned from a request to the backend
 * made through workview engine actions.
 *
 * Workview engine actions fire requests to the backend using `engine/backend.ts` which is
 * a `window.fetch` wrapper.
 */
const isBackendError = (e: any) => {
  if (e.name === 'SocketError') { return true }
  if (e.message === 'Network Error') { return true }
  return !!e.response
}

export const isClientError = (e: any) => !isBackendError(e)

const getCode = (error: ErrorResponse): keyof typeof errorsByCode | null => {
  if (error.message && error.message === 'Network Error') { return 'NETWORK_ERROR' }
  if (error.name === 'SocketError') { return 'SOCKET_ERROR' }
  if (error.response && error.response.data && error.response.data.errors) {
    return (error.response.data.errors as BackendError).code || null
  }

  return null
}

const getResponseStatus = (error: ErrorResponse) =>
  (error.response && error.response.status) || null

// a validation error will have a status of 422 and a payload.data.errors which is an object
export const isValidationError = ({ response }: any) =>
  response && response.status === 422 && !hasIn(response, 'data.errors.message')

/**
 * In some cases, backend returns a 422 without a list of per-field errors.
 * Instead, it just contains a single message
 * This function tells us if we got that type of resposne
 */
export const isValidationErrorWithMessage = ({ response }: any) =>
  response && response.status === 422 && hasIn(response, 'data.errors.message')

// some other backend error will have 'data.errors.message'
const isLoadingNeuralModelError = ({ response }: any) =>
  response && response.status === 404 && hasIn(response, 'data.error.message')

const normalizeErrors = (errors: ValidationError) => {
  const normalizedErrors: ValidationError = mapValues(errors, value => {
    if (Array.isArray(value)) {
      if (typeof value[0] === 'object') { return value }
      return upperFirst(value[0])
    }
    if (typeof value === 'string') { return value }

    return normalizeErrors(value)
  })

  return mapKeys(normalizedErrors, (value, key) => camelCase(key))
}

export const extractValidationErrors = ({ response }: ErrorResponse): ParsedValidationError => {
  const errors = response ? response.data.errors : {}
  return {
    isValidationError: true,
    ...normalizeErrors(errors as ValidationError)
  }
}

const getBackendError = (errorResponse: ErrorResponse): BackendError | null => {
  if (!('response' in errorResponse)) { return null }
  if (!errorResponse.response) { return null }
  if (!hasIn(errorResponse.response, 'data.errors.code')) { return null }
  return errorResponse.response.data.errors
}

/** Extracts frontend-defined message for an error */
const getMessageContent = (
  code: keyof typeof errorsByCode | null,
  status: number | null,
  messages?: ErrorMessageGroup,
  params?: any
): string => {
  if (params && !messages) {
    throw new Error('A message group needs to be specified when specifying params')
  }

  if (params && messages && messages.parametric) { return messages.parametric(params) }
  if (code && errorsByCode[code]) { return errorsByCode[code] }
  if (status && messages && messages[status]) { return messages[status] as string }
  if (messages) { return messages.default }
  return DEFAULT_ERROR
}

export const parseError =
  (errorResponse: ErrorResponse, messages?: ErrorMessageGroup, params?: any): ParsedError => {
    if (isClientError(errorResponse)) { throw errorResponse }

    if (isValidationError(errorResponse)) {
      return { error: extractValidationErrors(errorResponse) }
    }

    if (isValidationErrorWithMessage(errorResponse)) {
      const errorPayload = errorResponse.response?.data.errors

      return {
        error: {
          code: '422',
          detail: null,
          message: errorPayload?.message as string || '',
          backendMessage: errorPayload?.message as string || null,
          status: 422
        }
      }
    }

    if (isLoadingNeuralModelError(errorResponse)) {
      return {
        error: {
          code: '404',
          detail: null,
          message: 'Loading model...',
          backendMessage: null,
          status: 404
        }
      }
    }

    const code = getCode(errorResponse)
    const status = getResponseStatus(errorResponse)
    const backendError = getBackendError(errorResponse)

    const message = code === 'SOCKET_ERROR'
      ? errorResponse.message!
      : getMessageContent(code, status, messages, params)

    const error: ErrorWithMessage = {
      code,
      detail: (backendError && backendError.detail) || null,
      status,
      message,
      backendMessage: (backendError && backendError.message) || null
    }

    return { error }
  }

/**
 * Intended to be the one-size-fits-all handler for any caught error in a vuex store module
 *
 * @param {Vuex.Store} $store
 * The vuex store or store module this function was called from
 *
 * @param {Object} errorResponse
 * The argument of the catch scope of a try catch wrapping a backend request
 *
 * @param {Object} messages
 * A value from `errorMessages`
 */
export const handleError =
  (
    $store: Store<RootState>,
    errorResponse: ErrorResponse,
    messages?: ErrorMessageGroup,
    isToastingError: boolean = true,
    params?: any
  ): ParsedError => {
    const { error } = parseError(errorResponse, messages, params)

    if (isToastingError) {
      $store.dispatch('toast/warning', { content: error.message })
    }

    return { error }
  }

/**
 * Renders a toast message for a caught error.
 *
 * It selects the message in following priority
 * - by backend error `code`
 * - by network response status, for specified `messages` group
 * - a default message otherwise
 */
export const notifyError =
  ($store: Store<RootState>, errorResponse: ErrorResponse, messages: ErrorMessageGroup) => {
    const { error } = parseError(errorResponse, messages)
    const { message: content } = error
    return $store.dispatch('toast/warning', { content })
  }

export const notifyErrorByMessage = ($store: Store<RootState>, content: string) => {
  return $store.dispatch('toast/warning', { content })
}

export const notifyErrorByCode = ($store: Store<RootState>, errorCode: keyof typeof errorsByCode) =>
  $store.dispatch('toast/warning', { content: errorsByCode[errorCode] })

export * from './error/types'

export { errorMessages, errorsByCode }
