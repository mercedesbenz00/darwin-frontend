
import { Selector, ClientFunction } from 'testcafe'
import VideoModal from './dialogs/videoModal'

class DatasetTitleModel {
  titleInput = Selector('.dataset-title__inputs input').withAttribute('name', 'name')
  continueButton = Selector('.dataset-title__buttons button')
}

class DatasetDataModel {
  imageZone = Selector('.dataset-data .imagezone')
  imageZoneFile = Selector('.dataset-data .imagezone .imagezone__file__cell__container')

  browseButton = Selector('.dataset-create__box .button').withText('Browse Computer For Dataset')
  browseMoreButton = Selector('.dataset-create__box .button').withText('Browse more')
  pickButton = Selector('.dataset-create__box .button').withText('Pick existing Dataset')

  // using withText seems to fail on jenkins for this one
  // so we use a purely class-based selector
  continueButton = Selector('.dataset-create__box .button.right--item')
}

class DatasetInstructionsModel {
  editorToolbar = {
    boldButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'bold-1'),
    italicButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'italic-1'),
    underlineButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'underline-1'),
    orderedlistButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'formatOL-1'),
    unorderedlistButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'formatUL-1'),
    imageButton: Selector('.dataset-instructions__editor .fr-toolbar button').withAttribute('id', 'insertImage-1')
  }

  editorContent = Selector('.dataset-instructions__editor .fr-element')

  imageUploadArea = Selector('.dataset-instructions__editor .fr-popup .fr-image-upload-layer .fr-form input')
  continueButton = Selector('.dataset-instructions__buttons button.dataset-instructions__button--right')
}

class DatasetSettingsModel {
  continueButton = Selector('button.dataset-create__button')
}

export default class DatasetCreateModel {
  titleStep = new DatasetTitleModel()
  dataStep = new DatasetDataModel()
  instructionsStep = new DatasetInstructionsModel()
  settingsStep = new DatasetSettingsModel()
  videoModal = new VideoModal()

  isCreateStep = ClientFunction(
    () => window.location.href.endsWith('/datasets/create')
  )

  isDataStep = ClientFunction(
    () => window.location.href.endsWith('/data')
  )

  isInstructionsStep = ClientFunction(
    () => window.location.href.endsWith('/instructions')
  )

  isAnnotatorsStep = ClientFunction(
    () => window.location.href.endsWith('/annotators')
  )
}
