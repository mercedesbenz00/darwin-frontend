import { Selector } from 'testcafe'

class ProfileSettingsModel {
  deleteProfileButton = Selector('.profile__delete button')
  confirmDeleteButton = Selector('.settings__content .confirm-delete button').nth(1)
}

class TeamSettingsModel {
  nameInput = Selector('.team__body input[type="teamName"]')
}

class TeamMembersSettingsModel {
  newMember = {
    emailInput: Selector('.members__new__input input[type="text"]'),
    roleDropdown: Selector('.members__new__role .select2'),
    roleOptions: Selector('.select2-results__option')
  }

  members = Selector('.members__list .members__member')

  getMember (index: number) {
    return {
      trash: Selector('.member__trash').nth(index)
    }
  }
}

class TeamProfileModel {
  teamAvatar = Selector('.team__body .avatar .avatar__button__input')
  teamName = Selector('.team__info input[type="text"]')
  submitButton = Selector('button[type="submit"]')
  closeButton = Selector('.settings-pane__footer .button--secondary')
}

export default class SettingsModel {
  tabs = {
    profileTab: Selector('.settings__sidebar__item').nth(0),
    notificationsTab: Selector('.settings__sidebar__item').nth(1),
    teamTab: Selector('.settings__sidebar__item').nth(2),
    teamMembersTab: Selector('.settings__sidebar__item').nth(3)
  }

  profileSettings = new ProfileSettingsModel()
  teamMembersSettings = new TeamMembersSettingsModel()
  teamSettings = new TeamSettingsModel()
  teamProfileSettings = new TeamProfileModel()
}
