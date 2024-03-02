import { Selector, t } from 'testcafe'

export default class LoginModel {
  emails = Selector('.email-sidebar a')
  confirmInviteLink = Selector('a').withText(/JOIN THE TEAM/i)
  resetPasswordLink = Selector('a').withText(/RESET PASSWORD/i)

  selectSentEmail (email: string) {
    return t.click(this.emails.withText(email))
  }
}
