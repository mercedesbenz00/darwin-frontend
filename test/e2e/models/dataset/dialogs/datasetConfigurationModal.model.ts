import { Selector } from 'testcafe'

export default class DatasetConfigurationModal {
  modal = Selector('.video-modal')
  okButton = Selector('.video-modal .modal-footer button:not(.button--secondary)')
}
