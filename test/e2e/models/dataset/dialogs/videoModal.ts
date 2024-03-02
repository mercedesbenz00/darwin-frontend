import { Selector } from 'testcafe'

export default class VideoModal {
  cancelButton = Selector('.video-modal .modal-footer .button').nth(0)
  submitButton = Selector('.video-modal .modal-footer .button').nth(1)
}
