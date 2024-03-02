import { Selector, t } from 'testcafe'

export default class DataTabModel {
  // cards are rendered using a virtual scroller
  // visible images have `--active` in their class name
  cards = Selector('.gallery-card--active .card')
  checkedCards = Selector('.gallery-card--active .card input.check-box__input:checked')
  images = Selector('.gallery-card--active > .image-card')
  videos = Selector('.gallery-card--active > .video-card')
  contextMenuItems = Selector('.gallery-context-menu__item')

  newTaskPopover = {
    assigneeOption: Selector('.assign-task__popover .member-selection-item')
  }

  openImage (index: number) {
    return t
      .hover(this.images.nth(index))
      .click(this.images.nth(index).find('.card-button'))
  }

  openVideo (index: number) {
    return t
      .hover(this.videos.nth(index))
      .click(this.videos.nth(index).find('.card-button'))
  }

  selectImage (index: number) {
    return t
      .hover(this.images.nth(index))
      .wait(50)
      .click(this.images.nth(index).find('.overlay__checkbox'))
  }

  shiftSelectImage (index: number) {
    return t
      .hover(this.images.nth(index))
      .wait(50)
      .click(this.images.nth(index).find('.overlay__checkbox'), { modifiers: { shift: true } })
  }

  deleteSelection () {
    return t.click(this.contextMenuItems.nth(0))
  }

  createTaskFromSelection () {
    return t.click(this.contextMenuItems.nth(1))
  }
}
