
import { Selector, t } from 'testcafe'

export default class DropzoneModel {
  dragDropFiles (files: string[]) {
    const hiddenInput = Selector('.droparea__input', { visibilityCheck: false })
    return t.setFilesToUpload(hiddenInput, files)
  }
}
