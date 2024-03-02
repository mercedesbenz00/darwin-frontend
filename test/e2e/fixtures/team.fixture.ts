import 'testcafe'

import config from '../config'
import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { createFactory } from '../utils/factory'
import { generateEmail, clientLogin, getSentEmails, stripeStub } from '../utils/helpers'
import SidebarModel from '../models/sidebar.model'
import ProfileSettingsModel from '../models/profileSettings.model'
import RegisterModel from '../models/register.model'
import DatasetsModel from '../models/datasets.model'

const sidebarComponent = new SidebarModel()
const profileSettingsComponent = new ProfileSettingsModel()
const datasetsPage = new DatasetsModel()

fixture('Team')
  .beforeEach(async t => {
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)

    const user = await t.ctx.factory.create('user', { email: 'joe-team@v7labs.com', password: 'Password1' })

    const redTeam = await t.ctx.factory.create('team', { name: 'Red' })
    const blueTeam = await t.ctx.factory.create('team', { name: 'Blue' })
    await t.ctx.factory.create('membership', { user, team: redTeam, role: 'owner' })
    await t.ctx.factory.create('membership', { user, team: blueTeam, role: 'owner' })
    await t.ctx.factory.create('membership', { team: blueTeam, role: 'member' })

    await clientLogin(t, 'joe-team@v7labs.com', 'Password1')
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('team selection', async t => {
  await t.navigateTo(`${config.baseUrl}/datasets`)

  await sidebarComponent.openTeamMenu()

  // check overlay open and correct team selected
  await t.expect(sidebarComponent.teamOverlay.openOverlay.exists).ok()

  await t
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('Red')
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('1 team members')

  await sidebarComponent.teamOverlay.selectTeam('Blue')

  // check team selected and overlay still open
  await t
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('Blue')
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('2 team members')
    .expect(sidebarComponent.teamOverlay.openOverlay.exists).ok()

  // select 'Red' team
  await sidebarComponent.teamOverlay.selectTeam('Red')

  // check team selected
  await t
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('Red')
    .expect(sidebarComponent.teamOverlay.selectedTeam.textContent).contains('1 team members')
})

test('team member invite', async t => {
  await t.navigateTo(`${config.baseUrl}/datasets`)

  await sidebarComponent.openTeamMenu()
  await t.click(sidebarComponent.teamOverlay.selectedTeam)

  const email = generateEmail()
  const profileSettingsComponent = new ProfileSettingsModel()

  // create invite and make sure we can, as team owner, then delete invite
  await t
    .expect(profileSettingsComponent.tabs.teamMembersTab.exists).ok()
    .click(profileSettingsComponent.tabs.teamMembersTab)
    .typeText(profileSettingsComponent.teamMembersSettings.newMember.emailInput, email)
    .pressKey('enter')

  const member = await profileSettingsComponent.teamMembersSettings.getMember(1)
  await t.expect(member.trash.exists).ok()

  // check if email is sent
  const emails = await getSentEmails(t)
  const sentEmail = emails.find(e => e.to.map(a => a.email).includes(email))
  await t.expect(sentEmail).ok()
})

test('team member invite acceptance', async t => {
  const { token: { value: token } } = await t.ctx.factory.create('invitation', { role: 'member' })

  // signup for a new account using invite
  const registerPage = new RegisterModel()
  await t
    .navigateTo(`${config.baseUrl}/join?token=${token}`)
    .typeText(registerPage.firstNameInput, 'Joe')
    .typeText(registerPage.lastNameInput, 'Invite')
    .typeText(registerPage.passwordInput, 'Password1')
    .click(registerPage.termsAndConditionsCheckbox)
    .click(registerPage.submitButton)
    .expect(datasetsPage.isCurrent()).ok()

  const { teamSettings, teamMembersSettings } = profileSettingsComponent

  // check invited user only has basic team member privileges

  await sidebarComponent.openTeamMenu()

  await t
    .click(sidebarComponent.teamOverlay.selectedTeam)
    .expect(teamSettings.nameInput.exists).notOk()
    .click(profileSettingsComponent.tabs.teamMembersTab)
    .click(teamMembersSettings.newMember.roleDropdown)
    .expect(teamMembersSettings.newMember.roleOptions.count).eql(2)
})

test('team profile update', async t => {
  await t.navigateTo(`${config.baseUrl}/datasets`)

  await t
    .click(sidebarComponent.teamOverlayToggle)
    .click(sidebarComponent.teamOverlay.selectedTeam)
    .click(profileSettingsComponent.tabs.teamTab)

  await t
    .selectText(profileSettingsComponent.teamProfileSettings.teamName)
    .pressKey('delete')
    .typeText(profileSettingsComponent.teamProfileSettings.teamName, 'V7 test')
    .click(profileSettingsComponent.teamProfileSettings.submitButton)
    .expect(profileSettingsComponent.tabs.teamTab.textContent).contains('V7 test')
    .click(profileSettingsComponent.teamProfileSettings.closeButton)
    .expect(sidebarComponent.teamName.textContent).contains('V7 test')

  await t
    .click(sidebarComponent.teamOverlayToggle)
    .click(sidebarComponent.teamOverlay.selectedTeam)
    .click(profileSettingsComponent.tabs.teamTab)

  await t
    .setFilesToUpload(profileSettingsComponent.teamProfileSettings.teamAvatar, ['../../assets/avatar.png'])
    .click(profileSettingsComponent.teamProfileSettings.submitButton)
    .expect(sidebarComponent.teamAvatar.getAttribute('src')).contains('data:image/gif;base64,')
})
