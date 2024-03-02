import { ClientFunction, RequestMock } from 'testcafe'
import { v4 as uuidv4 } from 'uuid'

import config from '../config'
import { sandboxAxiosInstance } from './api'
import { Email } from '../types'
import LoginModel from '../models/login.model'

export const generateEmail = () => `joe-${uuidv4()}@mail.com`.replace(/-/g, 'x')

const localStorageSet = ClientFunction((key, val) => localStorage.setItem(key, val))

export const clientLogin = async (t: TestController, email: string, password: string) => {
  // fire navigation WHILE getting a token, to wslightly speed things up
  const promise = t.navigateTo(`${config.baseUrl}/login`)

  const { data } =
    await sandboxAxiosInstance(t.ctx.sandboxId).post('/users/authenticate', { email, password })

  await promise

  await localStorageSet('token', data.token)
  await localStorageSet('refresh_token', data.refresh_token)
  await localStorageSet('token_expire', data.token_expiration)

  return t
}

export const uiLogin = async (t: TestController, email: string, password: string) => {
  const login = new LoginModel()

  const isCurrent = await login.isCurrent()
  if (!isCurrent) { await t.navigateTo(`${config.baseUrl}/login`) }

  return t
    .typeText(login.emailInput, email, { paste: true })
    .typeText(login.passwordInput, password, { paste: true })
    .click(login.submitButton)
}

export const getSentEmails = async (t: TestController): Promise<Email[]> => {
  const { data } = await sandboxAxiosInstance(t.ctx.sandboxId).get('/sent_emails')
  return data
}

export const refreshPage = ClientFunction(() => window.location.reload)

export const stripeStub = RequestMock()
  .onRequestTo('https://js.stripe.com/v3/')
  .respond('')
  .onRequestTo('m.stripe.network')
  .respond('')
