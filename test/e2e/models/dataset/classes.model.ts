import { Selector, t } from 'testcafe'
import ClassDialogModel from './classes/classDialog.model'

export default class ClassesModel {
  newClassButton = Selector('button.classes-sidebar__create')
  dialog = new ClassDialogModel()
  classes = Selector('.class-card')

  /**
   * To edit a class, we need to
   *
   * - hover over the class card
   * - click the "Edit" button in the middle of the card
   *
   * This helper function automatically performs these steps.
   */
  editClass (name: string) {
    return t
      .hover(Selector('.class-card').withText(name))
      .click(Selector('.class-card').withText(name).find('.class-card__overlay__edit__button'))
  }
}
