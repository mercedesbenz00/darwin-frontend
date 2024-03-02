import nock from 'nock'

import { api } from '@/utils'

import { Mock, StorageMock } from './storageMocks'

const AUTH_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const initNock = (): nock.Scope => nock(process.env.VUE_APP_BASE_API as string)

describe('request', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: new Mock() })
    Object.defineProperty(window, 'sessionStorage', { value: new Mock() })
  })

  it('uses proper endpoint to fire requests', async () => {
    initNock()
      .post('/foo')
      .reply(200, { bar: 'foo' })

    const response = await api.request('foo', 'POST', { foo: 'bar' })
    expect(response.data).toEqual({ bar: 'foo' })
  })

  it('tries to refresh token if response is 401', async () => {
    const localStorage = (window.localStorage as StorageMock)
    localStorage.setItem(AUTH_TOKEN_KEY, 'auth_expired')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'refresh_valid')

    const scope = initNock()

    // first request should fail
    scope.post('/foo').reply(401, { })

    // there should be an automatic token refresh
    let authHeader
    scope.get('/refresh')
      .reply(function () {
        authHeader = this.req.headers.authorization
        return [200, { token: 'tok_auth' }]
      })

    // request after refresh should succeed
    scope.post('/foo').reply(200, { bar: 'foo' })

    const response = await api.request('foo', 'POST', { foo: 'bar' })

    expect(authHeader).toEqual('Bearer refresh_valid')
    expect(response.data).toEqual({ bar: 'foo' })
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toEqual('tok_auth')
  })
})

describe('download', () => {
  it('downloads a zip', async () => {
    expect.assertions(1)
    const scope = initNock()
    scope
      .get('/foo')
      .replyWithFile(200, `${process.cwd()}/test/unit/fixtures/export.json`)
    const result = await api.download('/foo')
    expect(result.data).toEqual(expect.any(Buffer))
  })

  it('responds with error as json', async () => {
    expect.assertions(1)
    const scope = initNock()
    scope.get('/foo').reply(403, { errors: { code: 'SUBSCRIPTION_UNPAID' } })

    try {
      await api.download('/foo')
    } catch (error: unknown) {
      if (!api.isApiError(error)) { throw error }
      expect(error.response?.data).toEqual({ errors: { code: 'SUBSCRIPTION_UNPAID' } })
    }
  })
})
