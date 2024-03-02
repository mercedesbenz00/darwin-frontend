import { IPoint } from '@/engineCommon/point'
import { ToolContext } from '@/engineV2/managers'

/**
 * Returns the given path if it's not undefined, and contains points.
 * @param context the tool context
 * @param path a list of { x, y } points
 */
export const validatePath = (context: ToolContext, path?: IPoint[]): IPoint[] | undefined => {
  if (!path || path.length === 0) {
    context.editor.store.dispatch('toast/notify', { content: 'Nothing found in this region' })
    return
  }
  return path
}
