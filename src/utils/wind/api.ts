/**
 * This utility contains api-related functions that deals with tokens
 * and requests to the backend.
 * It also manages the localStorage and sessionStorage to manage the tokens
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import qs from 'qs'

import { ApiResponse } from '@/store/types'
import { createWindAuth, CreateWindAuthParams } from '@/utils/backend'
import { resolveVariable } from '@/utils/config'
import {
  ErrorMessageGroup,
  ErrorWithMessage,
  isErrorResponse,
  ParsedError,
  parseError
} from '@/utils/error'

import { WindResponse } from './types'

const baseURL: string = resolveVariable(process.env.VUE_APP_WIND_API, '$WIND_API') as string

const paramsSerializer: AxiosRequestConfig['paramsSerializer'] = params =>
  qs.stringify(params, { arrayFormat: 'comma' })

const withCache = async (key: string, request: () => ReturnType<typeof createWindAuth>) => {
  const authResponse = await request()
  if ('data' in authResponse) { sessionStorage.setItem(key, authResponse.data.token) }
  return authResponse
}

export const resolveWindAuth = async (
  authParams: CreateWindAuthParams,
  useCache: boolean = true
) => {
  const key = `${authParams.action}:${authParams.teamId}`

  if (useCache) {
    const cached = sessionStorage.getItem(key)
    if (cached) { return { data: { token: cached } } }
  }

  return await withCache(key, () => createWindAuth(authParams))
}

const authHeaders = (token: string) => ({ Authorization: `ApiKey ${token}` })

const client = (token: string): AxiosInstance =>
  axios.create({ baseURL, paramsSerializer, headers: authHeaders(token) })

const unauthenticatedClient = (): AxiosInstance => axios.create({ baseURL, paramsSerializer })

type Requestor = () => Promise<AxiosResponse>

const wrap = async <T = any>(
  request: Requestor,
  errorGroup?: ErrorMessageGroup
): WindResponse<T> => {
  try {
    const response = await request()
    return response
  } catch (e: unknown) {
    if (!isErrorResponse(e)) { throw e }
    if (errorGroup) { return parseError(e, errorGroup) }

    const status = e.response ? e.response.status : null
    const code = e.response?.data.errors.code
    const error: ErrorWithMessage = {
      code: typeof code === 'string' ? code : null,
      detail: null,
      message: 'Wind error',
      backendMessage: null,
      status
    }
    return { error }
  }
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Wraps a request callback into an authenticated wind request
 *
 * Uses authParams to resolve authentication, either from cache or by making a
 * request to darwin backend to get a new wind auth key.
 *
 * Using token from authentication, instantiates an axios instance and passes it
 * into the request callback, so a request can be made.
 *
 * Wraps the response into a { data?, error? } structure.
 */
export const withAuth = async <T=any>(
  authParams: CreateWindAuthParams,
  request: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
  errorGroup?: ErrorMessageGroup,
  depth: number = 0
): Promise<ParsedError | ApiResponse<T>> => {
  // First, try to get the token from the cache
  const tokenResponse = await resolveWindAuth(authParams)
  if ('error' in tokenResponse) { return tokenResponse }

  // If we got a token, use it to make a request
  const response = await wrap(() => request(client(tokenResponse.data.token)), errorGroup)
  if (!('error' in response && response.error.status === 401)) { return response }

  // If we got an error, try to get a new token and retry the request
  // This time, we don't want to use the cache to resolve the token
  const authResponse = await resolveWindAuth(authParams, false)
  if ('error' in authResponse) { return response }

  // We use an exponentional backoff to avoid overloading the backend
  while (depth < 5) {
    await wait(2 ** depth * 10)
    const response = await wrap(() => request(client(authResponse.data.token)), errorGroup)
    if ('error' in response && response.error.status === 401) {
      depth += 1
      continue
    }
    return response
  }
  return response
}

/**
 * Wraps a request callback into an unauthenticated wind request.
 *
 * Instantiates an unauthenticated axios instance and passes it into the
 * request callback, so a request can be made.
 *
 * Wraps the response into a { data?, error? } structure.
 */
export const withoutAuth = async <T=any>(
  request: (client: AxiosInstance) => Promise<AxiosResponse<T>>,
  errorGroup?: ErrorMessageGroup
) => {
  const response = await wrap(() => request(unauthenticatedClient()), errorGroup)
  return response
}
