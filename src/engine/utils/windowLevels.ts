import { MIN_WINDOW_LEVELS, WindowLevels } from '@/engineCommon/imageManipulation'
import { DatasetVideoMetadata, DefaultWindow } from '@/store/types'

export const getMaxWindowLevel = (colorspace?: DatasetVideoMetadata['colorspace'] | null): number =>
  colorspace === 'RG16' ? 65535 : 255

/**
 * Returns default for colorspace window/level range or
 * formats provided window level
 *
 * @param colorspace
 * @param defaultWindow
 * @returns {[number, number]}
 */
export const getWindowLevelsRange = (
  colorspace?: DatasetVideoMetadata['colorspace'] | null,
  defaultWindow?: DefaultWindow | null
): WindowLevels => {
  let minLevel = MIN_WINDOW_LEVELS
  let maxLevel = getMaxWindowLevel(colorspace)

  if (defaultWindow) {
    const { min, max } = defaultWindow
    if (minLevel < min) { minLevel = min }
    if (maxLevel > max) { maxLevel = max }
  }

  return [minLevel, maxLevel]
}

export const refineWindowLevels = (
  value: number,
  colorspace: DatasetVideoMetadata['colorspace'] | null
): number => {
  const range = getWindowLevelsRange(colorspace)
  return Math.max(range[0], Math.min(range[1], value))
}
