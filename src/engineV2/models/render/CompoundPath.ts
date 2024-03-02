import { EditableImagePoint } from '@/engineCommon/point'

export interface CompoundPath {
  path: EditableImagePoint[]
  additionalPaths: EditableImagePoint[][]
}

/**
 * Builds a { xmin, xmax, ymin, ymax } object, representing a rectangle
 * circumscribing the given compound path. The fields of the object represent
 * the minimum and maximum x and y coordinates of the compound path.
 */
export const compoundPathOuterBox = (compoundPath: CompoundPath) => {
  const outerBox = { xmin: Infinity, xmax: 0, ymin: Infinity, ymax: 0 }
  for (const p of [compoundPath.path, ...compoundPath.additionalPaths]) {
    for (const point of p) {
      if (point.x < outerBox.xmin) { outerBox.xmin = point.x }
      if (point.x > outerBox.xmax) { outerBox.xmax = point.x }
      if (point.y < outerBox.ymin) { outerBox.ymin = point.y }
      if (point.y > outerBox.ymax) { outerBox.ymax = point.y }
    }
  }
  return outerBox
}
