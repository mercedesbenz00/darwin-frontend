/**
 * This utility contains api-related functions that deals with tokens
 * and requests to the backend.
 * It also manages the localStorage and sessionStorage to manage the tokens
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
  CancelToken,
  ResponseType
} from 'axios'
import qs from 'qs'

import { resolveVariable } from './config'

import { getToken, getRefreshToken, clearToken, session, ErrorWithMessage } from '.'

// primary client for backend requests

/**
 * Axios interceptor which adds an authorization header to all requests,
 * if access token is available in local storage
 */
const addAccessTokenHeader = (request: AxiosRequestConfig): AxiosRequestConfig => {
  const token = getToken()
  if (token) { request.headers.Authorization = `Bearer ${token}` }
  return request
}

/**
 * Primary client used to perform backend requests.
 *
 * Signs all requests with an access token, if available.
 */
export const client = axios.create({
  baseURL: resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'comma' })
})

export const clientV2 = axios.create({
  baseURL: resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
})

/** Axios interceptor which parses an error response as JSON, even if the
 * success response is an `arraybuffer`
 *
 * This is needed when performing downloads from backend, to properly parse errors.
 */
const parseArrayBufferError = (error: AxiosError): Promise<never> => {
  if (
    !axios.isCancel(error) && // ignore cancelled messages
    error.config.responseType === 'arraybuffer' &&
    error.response && error.response.headers['content-type'] === 'application/json'
  ) {
    error.response.data = JSON.parse(error.response.data)
  }

  return Promise.reject(error)
}

/**
 * Axios interceptor which handles an expired access token error by requesting a
 * refreshed access token before retrying the original request.
 *
 * Retries happen only once
 */
const handleExpiredAccessToken = async (error: AxiosError): Promise<AxiosResponse<any>> => {
  if (!error.response) { return Promise.reject(error) }
  if (error.response.status !== 401) { return Promise.reject(error) }

  clearToken()

  const { error: refreshError } = await session.updateAccessToken()
  if (refreshError) { return Promise.reject(error) }

  return client.request(error.config)
}

const handleExpiredAccessTokenV2 = async (error: AxiosError): Promise<AxiosResponse<any>> => {
  if (!error.response) { return Promise.reject(error) }
  if (error.response.status !== 401) { return Promise.reject(error) }

  clearToken()

  const { error: refreshError } = await session.updateAccessToken()
  if (refreshError) { return Promise.reject(error) }

  return clientV2.request(error.config)
}

client.interceptors.request.use(addAccessTokenHeader)
client.interceptors.response.use(undefined, handleExpiredAccessToken)
client.interceptors.response.use(undefined, parseArrayBufferError)

clientV2.interceptors.request.use(addAccessTokenHeader)
clientV2.interceptors.response.use(undefined, handleExpiredAccessTokenV2)
clientV2.interceptors.response.use(undefined, parseArrayBufferError)

// Primary client public interface

export type AdditionalRequestOptions = {
  cancelToken?: CancelToken,
  params?: any,
  responseType?: ResponseType
}

/**
 * Main request method for use with the primary backend client
 */
export const request = <T = any>(
  url: string,
  method: Method,
  data: any,
  options: AdditionalRequestOptions = {}
): Promise<AxiosResponse<T>> => client.request({ method, url, data, ...options })

export const requestV2 = <T = any>(
  url: string,
  method: Method,
  data: any,
  options: AdditionalRequestOptions = {}
): Promise<AxiosResponse<T>> => clientV2.request({ method, url, data, ...options })

/**
 * Utility method for downloading files from backend.
 *
 * Defaults to arraybuffer as response type.
 */
export const download = <T = any>(
  url: string,
  options: AdditionalRequestOptions = { responseType: 'arraybuffer' }
): Promise<AxiosResponse<T>> => request<T>(url, 'get', null, options)

/**
 * Utility method for GET requests to the backend
 */
export const get = <T = any>(url: string, params?: object): Promise<AxiosResponse<T>> =>
  request<T>(url, 'get', null, { params })

export const getV2 = <T = any>(url: string, params?: object): Promise<AxiosResponse<T>> =>
  requestV2<T>(url, 'get', null, { params })

/**
 * Utility method for POST requests to the backend
 */
export const post = <T = any>(
  url: string,
  data?: object,
  options?: AdditionalRequestOptions
): Promise<AxiosResponse<T>> => request<T>(url, 'post', data, options)

/**
 * Utility method for PUT requests to the backend
 */
export const put = <T = any>(
  url: string,
  data?: object,
  options?: AdditionalRequestOptions
): Promise<AxiosResponse<T>> => request<T>(url, 'put', data, options)

/**
 * Utility method for DELETE rquests to the backend
 */
export const remove = <T = any>(
  url: string,
  data?: object,
  options?: AdditionalRequestOptions
): Promise<AxiosResponse<T>> => request<T>(url, 'delete', data, options)

// Requests using REFRESH token

/**
 * Axios interceptor.
 *
 * Signs all requests to the backend with an authorization header containing the access token.
 *
 * If the token has expired, the request to backend will fail,
 * but will triger a refresh of the access token, followed by a retry.
 */
const addRefreshTokenHeader = (request: AxiosRequestConfig): AxiosRequestConfig => {
  const token = getRefreshToken()
  if (token) { request.headers.Authorization = `Bearer ${token}` }
  return request
}

/**
 * Client used to perform refresh-token related requests to the backend
 *
 */
export const refreshClient = axios.create({
  baseURL: resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string,
  paramsSerializer: params => qs.stringify(params, { arrayFormat: 'comma' })
})

refreshClient.interceptors.request.use(addRefreshTokenHeader)

/**
 * Utility method to send a logout request to a fixed backend endpoint
 */
export const logout = () => refreshClient.get('users/logout')

/**
 * Utility method to send a team selection request to a fixed backend endpoint.
 */
export const selectTeam = (params: object) => refreshClient.post('users/select_team', params)

/**
 * Utility method to refresh the access token using the refresh token
 */
export const refreshAccessToken = (params: object) => refreshClient.post('refresh', params)

// MISC

/**
 * General axios helper method to load an SVG from a specified URL
 */
export const loadSVGFile = (url: string) =>
  axios({ method: 'GET', url, headers: { 'Content-Type': 'image/svg' } })

/**
 * General axios helper method to upload data to S3, using a signed S3 upload url
 */
export const uploadToS3 = (uploadUrl: string, data: Blob, type: string | null) =>
  axios({
    method: 'PUT',
    url: uploadUrl,
    data,
    headers: type ? { 'Content-Type': type } : {}
  })

export const isApiError = (error: unknown): error is AxiosError<ErrorWithMessage> =>
  axios.isAxiosError(error) && 'code' in error.response?.data?.errors
