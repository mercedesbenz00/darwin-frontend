import { Selector } from 'testcafe'
import VideoModal from './videoModal'

export default class AddToDatasetModal {
  modal = Selector('.modal-new-dataset')
  browseBtn = Selector('.modal-new-dataset .new__dataset__form__dropzone__buttons--col button')
  uploadBtn = Selector('.modal-new-dataset .modal__footer--new--dataset button')
  closeBtn = Selector('.modal-new-dataset .modal__header__close')
  sets = Selector('.file-set')
  videoModal = new VideoModal()
}
