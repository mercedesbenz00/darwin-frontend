import 'testcafe'

import { initSandbox, checkinSandbox } from '../utils/sandbox'
import { generateEmail, getSentEmails, stripeStub } from '../utils/helpers'
import RegisterModel from '../models/register.model'
import RegisterTeamModel from '../models/registerTeam.model'
import SidebarModel from '../models/sidebar.model'
import config from '../config'
import { createFactory } from '../utils/factory'
import DatasetsModel from '../models/datasets.model'

const registerPage = new RegisterModel()
const datasetsPage = new DatasetsModel()

fixture('Register Page')
  .page(`${config.baseUrl}`)
  .beforeEach(async t => {
    await initSandbox(t)
    const sandboxId = await initSandbox(t)
    t.ctx.factory = await createFactory(sandboxId)
  })
  .afterEach(async t => checkinSandbox(t))
  .requestHooks(stripeStub)

test('Register a new user and create a new team', async t => {
  const email = generateEmail()
  const password = 'Password1'

  const { token: { value } } = await t.ctx.factory.create('team_owner_invitation', { email })

  // Register a new user
  await t
    .navigateTo(`/register?token=${value}`)
    .typeText(registerPage.firstNameInput, 'Love')
    .typeText(registerPage.lastNameInput, 'World')
    .expect(registerPage.emailInput.value).eql(email)
    .typeText(registerPage.passwordInput, password)
    .click(registerPage.termsAndConditionsCheckbox)
    .click(registerPage.submitButton)
    .expect(registerPage.isOnRegisterTeam()).ok()

  // Enter new team info and submit
  const registerTeamPage = new RegisterTeamModel()
  const memberEmail = generateEmail()

  // Send invitations to the team members
  const member = await registerTeamPage.getMember(0)
  await t
    .typeText(member.name, memberEmail)
    .click(member.roleDropdown)
    .click(member.roleDropdownOptions.withText('User'))
  await t.expect(registerTeamPage.members.count).eql(2)

  // Set team name and upload avatar
  const teamName = 'V3'
  await t
    .typeText(registerTeamPage.nameInput, teamName)
    .setFilesToUpload(registerTeamPage.uploadInput, ['../../assets/avatar.png'])
    .expect(registerTeamPage.avatar.getAttribute('src')).ok()

  await t
    .click(registerTeamPage.submitButton)
    .expect(datasetsPage.isCurrent()).ok()

  // Check team name and avatar
  const sidebarModel = new SidebarModel()
  await sidebarModel.hasTeamAvatar()
  await t.expect(sidebarModel.teamName.withText(teamName).exists).ok()

  const invites = await getSentEmails(t)
  const invite = invites.find(e => e.to.map(a => a.email).includes(memberEmail))
  await t.expect(invite).ok()
})
