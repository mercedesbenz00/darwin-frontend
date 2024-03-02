/**
 * Object related helper functions
 */

/**
 * Returns alphabetically provious key for a given key of an object which is
 * built out of purely numerical keys
 *
 * Example:
 * ```
 * getPreviousFrameIndex({ '1': 'foo', '2': 'bar' }, '2')
 *
 * '1'
 * ```
 */
export const getPreviousFrameIndex = (
  frames: Record<string, unknown>,
  key: number
): number | null => {
  let prevIdx: number | null = null

  const sortedIndices = Object.keys(frames).map(idx => parseInt(idx)).sort((a, b) => a - b)
  for (const index of sortedIndices) {
    if (index < key) {
      prevIdx = index
    }
    if (index > key) {
      break
    }
  }

  return prevIdx
}
