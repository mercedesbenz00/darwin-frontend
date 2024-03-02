import { Selector, t } from 'testcafe'

class TeamOverlay {
  teams = Selector('.sidebar__overlay__item')
  selectedTeam = this.teams.nth(0)
  openOverlay = Selector('.sidebar__overlay')

  selectTeam (name: string) {
    return t.click(this.teams.withText(name))
  }
}

export default class SidebarModel {
  teamOverlayToggle = Selector('.sidebar .sidebar__profile')
  teamAvatar = Selector('.sidebar .sidebar__profile .sidebar__profile__avatar')
  teamName = Selector('.sidebar .sidebar__profile .sidebar__profile__name')
  logoutButton = Selector('.sidebar .sidebar__overlay .sidebar__overlay__logout')
  teamOverlay = new TeamOverlay()

  openTeamMenu () {
    return t.click(this.teamOverlayToggle)
  }

  hasTeamAvatar () {
    return t
      .expect(this.teamAvatar.exists).ok()
      .expect(this.teamAvatar.getAttribute('src')).ok()
  }

  logout () {
    return t
      .click(this.teamOverlayToggle)
      .click(this.logoutButton)
  }
}
