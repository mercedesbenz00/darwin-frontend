import { Selector } from 'testcafe'

export default class RequestPasswordResetModel {
  emailInput = Selector('input[type="email"]')
  submitButton = Selector('button[type="submit"]')
  isSubmitButtonDisabled = Selector('button[type="submit"]:disabled').exists
}
