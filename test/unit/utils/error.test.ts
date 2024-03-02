import { ValidationError } from '@/store/types/ValidationError'
import { extractValidationErrors, SocketError } from '@/utils'
import {
  BackendError,
  constructError,
  errorMessages,
  ErrorResponse,
  errorsByCode,
  isValidationError,
  parseError
} from '@/utils/error'
import { ErrorCodes } from '@/utils/error/errors'

const errorWithCode: BackendError = {
  code: 'ANNOTATIONS_LIMIT_REACHED',
  message: 'Backend Message',
  detail: { foo: 'bar' }
}

const validationError: ValidationError = {
  stages: [
    {
      config: {
        dataset_id: ["can't be blank"]
      }
    },
    {},
    {},
    {}
  ]
}

const responseWithCode: ErrorResponse = {
  response: {
    status: 401,
    data: {
      errors: errorWithCode
    }
  }
}

const responseWithValidationError: ErrorResponse = {
  response: {
    status: 422,
    data: {
      errors: validationError
    }
  }
}

const errorWithoutCode: BackendError = { message: 'random' }

const responseWithoutCode: ErrorResponse = {
  response: {
    status: 401,
    data: {
      errors: errorWithoutCode
    }
  }
}

describe('construct error', () => {
  (Object.keys(ErrorCodes) as Array<keyof typeof errorsByCode>).forEach((code) => {
    it(`constructs error for code ${code}`, () => {
      expect(constructError(code, 'custom message'))
        .toEqual({
          error: {
            code,
            backendMessage: null,
            detail: null,
            message: 'custom message',
            status: null
          }
        })
    })
  })
})

describe('parseError', () => {
  it('parses backend error with code', () => {
    expect(parseError(responseWithCode)).toEqual({
      error: {
        backendMessage: 'Backend Message',
        code: 'ANNOTATIONS_LIMIT_REACHED',
        detail: { foo: 'bar' },
        message: errorsByCode.ANNOTATIONS_LIMIT_REACHED,
        status: 401
      }
    })
  })

  it('parses backend error without code and no message group specified', () => {
    expect(parseError(responseWithoutCode)).toEqual({
      error: {
        backendMessage: null,
        code: null,
        detail: null,
        message: "Something's wrong. Try that action again",
        status: 401
      }
    })
  })

  it('parses backend error without code and message group specified', () => {
    expect(parseError(responseWithoutCode, errorMessages.DATASET_CREATE)).toEqual({
      error: {
        backendMessage: null,
        code: null,
        detail: null,
        message: errorMessages.DATASET_CREATE[401],
        status: 401
      }
    })
  })

  const clientError: ErrorResponse = new Error('Random client error')

  it('raises on client error', () => {
    expect(() => parseError(clientError)).toThrow()
  })

  const networkError: ErrorResponse = new Error('Network Error')

  it('parses network error', () => {
    expect(parseError(networkError)).toEqual({
      error: {
        backendMessage: null,
        code: 'NETWORK_ERROR',
        detail: null,
        message: errorsByCode.NETWORK_ERROR,
        status: null
      }
    })
  })

  const socketError = new SocketError('Test error', { type: 'join', topic: 'random:1' })

  it('parses socket error', () => {
    expect(parseError(socketError)).toEqual({
      error: {
        backendMessage: null,
        code: 'SOCKET_ERROR',
        detail: null,
        message: socketError.message,
        status: null
      }
    })
  })
})

describe('isValidationError', () => {
  it('returns true for flat validation error payload', () => {
    const payload = {
      response: {
        status: 422,
        data: { errors: { name: 'Has already been taken ' } }
      }
    }
    expect(isValidationError(payload)).toBe(true)
  })

  it('returns true for nested object validation error payload', () => {
    const payload = {
      response: {
        status: 422,
        data: {
          errors: { billing_address: { first_name: 'Has already been taken ' } }
        }
      }
    }
    expect(isValidationError(payload)).toBe(true)
  })

  it('returns true for nested array validation error payload', () => {
    const payload = {
      response: {
        status: 422,
        data: {
          errors: { stages: [{ config: { dataset_id: ["can't be blank"] } }] }
        }
      }
    }
    expect(isValidationError(payload)).toBe(true)
  })

  it('returns false for generic bad params response', () => {
    const payload = {
      response: {
        status: 422,
        data: { errors: { message: 'Bad Arguments' } }
      }
    }
    expect(isValidationError(payload)).toBe(false)
  })

  it('returns false for 200 response', () => {
    const payload = { response: { status: 200 } }
    expect(isValidationError(payload)).toBe(false)
  })

  it('returns false for 500 response', () => {
    const payload = { response: { status: 500 } }
    expect(isValidationError(payload)).toBe(false)
  })

  it('returns false for a 400 response', () => {
    const payload = { response: { status: 400 } }
    expect(isValidationError(payload)).toBe(false)
  })

  it('returns false for a 404 response', () => {
    const payload = { response: { status: 404 } }
    expect(isValidationError(payload)).toBe(false)
  })
})

describe('extractValidationErrors', () => {
  it('should return the payload as array', () => {
    expect(extractValidationErrors(responseWithValidationError).stages).toBeTruthy()
    expect(Array.isArray(extractValidationErrors(responseWithValidationError).stages)).toBeTruthy()
    expect(extractValidationErrors(responseWithValidationError).stages).toEqual(validationError.stages)
  })
})
