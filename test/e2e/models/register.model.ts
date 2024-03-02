import { Selector, ClientFunction } from 'testcafe'

export default class RegisterModel {
  firstNameInput = Selector('.register__form__first__name input')
  lastNameInput = Selector('.register__form__last__name input')
  emailInput = Selector('.register__form__email input')
  passwordInput = Selector('.register__form__password input')
  // technically, selector should be `label .check-box__label`
  // but testcafe clicks at the horizontal center of an element
  // so that would result in the test clicking on the /terms-and-conditions
  // link
  termsAndConditionsCheckbox = Selector('label .check-box__label__box')
  submitButton = Selector('button[type="submit"]')

  /**
   * Indicates if currently on /register-team
   */
  isOnRegisterTeam = ClientFunction(
    () => window.location.href.toString().indexOf('register-team') >= 0
  )
}
