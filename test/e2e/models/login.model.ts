import { Selector, ClientFunction } from 'testcafe'

export default class LoginModel {
  emailInput = Selector('input[type="email"]')
  passwordInput = Selector('input[type="password"]')
  submitButton = Selector('button[type="submit"]')
  forgotPasswordLink = Selector('.login__form__input--forgot__password')

  /**
   * Indicates if currently on /login or not
   */
  isCurrent = ClientFunction(
    () => window.location.href.endsWith('/login')
  )

  /**
   * Indicates if currently on /register-team
   */
  isRedirectedToRegisterTeam = ClientFunction(
    () => window.location.href.endsWith('/register-team')
  )

  /**
   * Indicates if currently on /datasets
   */
  isRedirectedToDatasets = ClientFunction(
    () => window.location.href.endsWith('/datasets')
  )

  /**
   * Indicates if currently on /account-deleted
   */
  isRedirectedToAccountDeleted = ClientFunction(
    () => window.location.href.endsWith('/account-deleted')
  )
}
