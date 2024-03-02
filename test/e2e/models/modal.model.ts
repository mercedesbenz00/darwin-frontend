import { Selector } from 'testcafe'

export default class ModalModel {
  closeButton = Selector('.modal__close-button')
  open = Selector('.v--modal-overlay')
}
