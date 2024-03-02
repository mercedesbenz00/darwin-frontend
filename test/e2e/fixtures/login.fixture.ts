import 'testcafe'

import LoginModel from '../models/login.model'
import RequestPasswordResetModel from '../models/requestPasswordReset.model'
import PasswordResetModel from '../models/passwordReset.model'
import SidebarModel from '../models/sidebar.model'
import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory } from '../utils/factory'
import { generateEmail, getSentEmails, stripeStub } from '../utils/helpers'
import config from '../config'

const loginPage = new LoginModel()
const sidebarComponent = new SidebarModel()

fixture('Login Page')
  .beforeEach(async t => {
    t.ctx.factory = await createFactory(await initSandbox(t))
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('Failed login', async t => {
  // failed login
  await t
    .navigateTo(`${config.baseUrl}/login`)
    .typeText(loginPage.emailInput, 'nouser@v7labs.com')
    .typeText(loginPage.passwordInput, 'Password1')
    .click(loginPage.submitButton)
    .expect(loginPage.isCurrent()).ok()
})

test('Login as teamless user', async t => {
  await t.ctx.factory.create('user', { email: 'noteam@v7labs.com', password: 'Password2' })

  await t
    .navigateTo(`${config.baseUrl}/login`)
    .typeText(loginPage.emailInput, 'noteam@v7labs.com')
    .typeText(loginPage.passwordInput, 'Password2')
    .click(loginPage.submitButton)
    .expect(loginPage.isRedirectedToRegisterTeam()).ok()
})

test('Login as fully onboarded user', async t => {
  const user = await t.ctx.factory.create('user', { email: 'yesteam@v7labs.com', password: 'Password3' })
  const team = await t.ctx.factory.create('team')
  await t.ctx.factory.create('membership', { user, team, role: 'owner' })

  await t
    .navigateTo(`${config.baseUrl}/login`)
    .typeText(loginPage.emailInput, 'yesteam@v7labs.com')
    .typeText(loginPage.passwordInput, 'Password3')
    .click(loginPage.submitButton)
    .expect(loginPage.isRedirectedToDatasets()).ok()
})

test('Password reset', async t => {
  const email = generateEmail()
  const user = await t.ctx.factory.create('user', { email, password: 'Forgotten' })
  const team = await t.ctx.factory.create('team')
  await t.ctx.factory.create('membership', { user, team, role: 'owner' })

  const requestPasswordResetPage = new RequestPasswordResetModel()

  // request a password reset
  await t
    .navigateTo(`${config.baseUrl}/login`)
    .click(loginPage.forgotPasswordLink)
    .typeText(requestPasswordResetPage.emailInput, email)
    .click(requestPasswordResetPage.submitButton)
    .expect(requestPasswordResetPage.isSubmitButtonDisabled).ok()

  const emails = await getSentEmails(t)
  const sentEmail = emails.find(e => e.to.map(a => a.email).includes(email))

  await t.expect(sentEmail).ok()

  const passwordResetPage = new PasswordResetModel()
  // submit new password
  await t
    .navigateTo(sentEmail!.assigns.url)
    .typeText(passwordResetPage.passwordInput, 'ChangedPassword2')
    .typeText(passwordResetPage.passwordConfirmationInput, 'ChangedPassword2')
    .click(passwordResetPage.submitButton)
    .expect(loginPage.isRedirectedToDatasets()).ok()

  await sidebarComponent.logout()

  // check that login is possible with new password
  await t
    .expect(loginPage.isCurrent()).ok()
    .typeText(loginPage.emailInput, email)
    .typeText(loginPage.passwordInput, 'ChangedPassword2')
    .click(loginPage.submitButton)
    .expect(loginPage.isRedirectedToDatasets()).ok()
})
