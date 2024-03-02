import { ToolContext } from '@/engine/managers'
import { IPoint } from '@/engineCommon/point'

/**
 * Returns the given path if it's not undefined, and contains points.
 * @param context the tool context
 * @param path a list of { x, y } points
 */
export const validatePath = (context: ToolContext, path?: IPoint[]): IPoint[] | undefined => {
  if (!path || path.length === 0) {
    if (context.editor.toast) {
      context.editor.toast({
        message: 'Nothing found in this region',
        isError: false
      })
    }
    return
  }
  return path
}
