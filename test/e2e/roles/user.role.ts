import { Role } from 'testcafe'
import config from '../config'
import LoginModel from '../models/login.model'

const page = new LoginModel()

export function getRegularUser () {
  return Role(`${config.baseUrl}/login`, async t => {
    // paste speeds up typing this in, thus speeding up tests in general
    await t
      .typeText(page.emailInput, 'andrea@v7labs.com', { paste: true })
      .typeText(page.passwordInput, 'Password1', { paste: true })
      .click(page.submitButton)
  })
}
