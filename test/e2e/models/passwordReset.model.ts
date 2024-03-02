import { Selector } from 'testcafe'

export default class PasswordResetModel {
  passwordInput = Selector('input[type="password"]').nth(0)
  passwordConfirmationInput = Selector('input[type="password"]').nth(1)
  submitButton = Selector('button[type="submit"]')
}
