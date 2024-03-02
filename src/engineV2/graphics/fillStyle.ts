import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { RGBA, rgbaString } from '@/utils'

import { highlightedAlpha, defaultAlpha } from './renderingConstants'

export const fillStyle = (
  color: RGBA,
  filter: ImageManipulationFilter | null,
  inferred: boolean,
  isHighlighted: boolean,
  isSelected: boolean
): string => {
  if (!filter) {
    const alpha = (inferred || isHighlighted || isSelected ? highlightedAlpha : defaultAlpha)
    return rgbaString(color, alpha)
  }

  const alpha = inferred || isHighlighted || isSelected ? highlightedAlpha : filter.opacity / 100.0
  return rgbaString(color, alpha)
}
