import 'testcafe'

import { uiLogin, stripeStub } from '../utils/helpers'
import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory } from '../utils/factory'

import LoginModel from '../models/login.model'
import SidebarModel from '../models/sidebar.model'
import ProfileSettingsModel from '../models/profileSettings.model'

const loginPage = new LoginModel()
const sidebarComponent = new SidebarModel()
const profileSettingsComponent = new ProfileSettingsModel()

fixture('Profile settings')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)

    const user = await t.ctx.factory.create('user', { email: 'joe-profile@v7labs.com', password: 'Password1' })
    const team = await t.ctx.factory.create('team')
    await t.ctx.factory.create('membership', { user, team, role: 'owner' })
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('Profile deletion', async t => {
  await uiLogin(t, 'joe-profile@v7labs.com', 'Password1')
  await t
    .click(sidebarComponent.teamOverlayToggle)
    .click(sidebarComponent.teamOverlay.selectedTeam)
    .click(profileSettingsComponent.tabs.profileTab)
    .click(profileSettingsComponent.profileSettings.deleteProfileButton)
    .click(profileSettingsComponent.profileSettings.confirmDeleteButton)
    .expect(loginPage.isCurrent()).ok()

  await t
    .typeText(loginPage.emailInput, 'joe-profile@v7labs.com', { paste: true })
    .typeText(loginPage.passwordInput, 'Password1', { paste: true })
    .click(loginPage.submitButton)
    .expect(loginPage.isRedirectedToAccountDeleted()).ok()
})
