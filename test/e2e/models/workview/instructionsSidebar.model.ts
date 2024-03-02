import { Selector } from 'testcafe'

export default class InstructionsSidebarModel {
  openButton = Selector('.instructions-sidebar__button--open')
  closeButton = Selector('.instructions-sidebar__button--close')
  fullInstructionsButton = Selector('.instructions__full-description-link')
  sideBar = Selector('.instructions-sidebar')
  open = Selector('.instructions-sidebar.instructions-sidebar--open')
}
