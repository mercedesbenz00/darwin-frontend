import { ToolContext } from '@/engine/managers'
import { Annotation, isVideoSubAnnotations } from '@/engine/models'

/**
 * Removes the `auto_annotate` key from a parent annotation's payload
 *
 * This is used with video annotations, as previous logic,
 * will incorrectly add an `auto_annotate` key to the root video annotation data object.
 * This then fixes the data structure by subsequently removing the key
 *
 * On a non-video annotation, this won't do anything.
 */
export const removeSubAutoAnnotate = (
  context: ToolContext,
  parent: Annotation
) => {
  const { loadedVideo } = context.editor.activeView
  if (!loadedVideo) { throw new Error('Click: Expected video to be loaded') }

  const newParentAnnotation = parent.shallowClone()
  if (isVideoSubAnnotations(newParentAnnotation.subAnnotations)) {
    const subAnnotationFrames = newParentAnnotation.subAnnotations.frames
    for (const [index, frameData] of Object.entries(subAnnotationFrames)) {
      const i = frameData.findIndex(elem => elem.type === 'auto_annotate')
      if (i !== -1) {
        frameData.splice(i, 1)
        subAnnotationFrames[index] = frameData
      }
    }
  }
  return newParentAnnotation
}
