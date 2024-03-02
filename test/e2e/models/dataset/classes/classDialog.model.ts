import { Selector } from 'testcafe'

export default class ClassDialogModel {
  nameField = Selector('.annotation-class-modal input[name="className"]')
  descriptionField = Selector('.annotation-class-modal textarea[name="classDescription"]')
  zoomSlider = Selector('.annotation-class-modal .vue-slider-dot-handle')
  imageCarouselFirst = Selector('.annotation-class-modal .annotation__crop-control-carousel .vue-recycle-scroller__item-view').nth(0)
  cancelButton = Selector('.annotation-class-modal .modal__footer .button.button--secondary')
  saveButton = Selector('.annotation-class-modal .modal__footer .button:not(.button--secondary)')

  annotationTypes = {
    boundingBox: Selector('.annotation-type-item').withText('Bounding Box')
  }
}
