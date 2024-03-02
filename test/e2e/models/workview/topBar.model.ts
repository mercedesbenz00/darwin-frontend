import { Selector } from 'testcafe'

export default class topBarModel {
  paginationButtonPrev = Selector('.pagination-button--prev')
  paginationButtonNext = Selector('.pagination-button--next')
  paginationInput = Selector('.pagination__input')
  skipButton = Selector('.discard__button')
  skipOptions = Selector('.discard-option__button')
  completeTaskButton = Selector('.send-to-review-button')
  backButton = Selector('.top-bar__logo-button')
}
