import { addAnnotationAction, updateAnnotationData } from '@/engineV2/actions'
import { ToolContext } from '@/engineV2/managers'
import { ClickerTool } from '@/engineV2/plugins/click/ClickerTool'

/**
 * While clicking within the clicker selection area,
 * additional click actions are handled through an action group,
 * so individual clicks can be undone.
 *
 * Once the annotator clicks outside the click area, undo should move the
 * annotation back to the point it was at BEFORE the clicker was opened.
 *
 * This function, when completing cliker, converts the internal action group to
 * a global action that does exactly this.
 */
export const transitionToAction = (clicker: ClickerTool, context: ToolContext) => {
  const { actionGroup } = clicker
  if (!actionGroup) { return }

  // actionGroup.remove will result in canUndo being false
  // we're interested in the value before removing
  const { canUndo } = actionGroup

  // the action group can be removed. all the data necessary to build a global
  // action is on the tool instance itself
  actionGroup.remove()
  clicker.actionGroup = undefined

  /**
   * if all the group's actions have been undone already, that means the annotation
   * is in the same state it was in before we resumed the clicker.
   * In that case, there is no need to transition to a global action, as undoing or
   * redoing that one would do nothing.
   */
  if (!canUndo) { return }

  /**
   * Current annotation holds the most recent, updated data
   * If the current annotation is not in the editor it should also not be saved
   */
  const { currentAnnotation: annotation } = clicker
  if (!annotation) { return }
  if (!context.editor.activeView.annotationManager.hasAnnotation(annotation.id)) { return }

  /**
   * This field holds data the annotation had before clicker was opened
   * NOTE: It only holds the polygon data. We currently do not have an action which
   * would update main and sub-annotatio data at the same time, so clicker changes
   * will not be undone in the transitioned action, only polygon changes.
   */
  const oldData = clicker.initialAnnotationData

  /**
   * If there is old data, it means the clicker was opened on an edited annotation
   * so we transition to an update action.
   * Otherwise, the annotation was newly created with the clicker, so it's a create action.
   */
  const action = (oldData)
    ? updateAnnotationData(context.editor.activeView, annotation, oldData, annotation.data)
    : addAnnotationAction(context.editor.activeView, annotation)

  const { id } = annotation

  /**
   * Undoing could happen from within the clicker being reopened. In that case,
   * we also need to reset the clicker, if it's for the same annotation we were
   * working on at the time. We wrap the generated action in order to achieve this.
   */
  context.editor.actionManager.done({
    do: action.do,
    undo () {
      if (id === clicker.currentAnnotation?.id) {
        clicker.reset(context)
      }
      return action.undo()
    }
  })
}
