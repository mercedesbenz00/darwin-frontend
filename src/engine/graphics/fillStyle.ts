import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { RGBA, rgbaString } from '@/utils'

export const fillStyle = (
  color: RGBA,
  filter: ImageManipulationFilter | null,
  inferred: boolean,
  isHighlighted: boolean,
  isSelected: boolean
): string => {
  if (!filter) {
    const alpha = (inferred || isHighlighted || isSelected ? 0.1 : 0.15)
    return rgbaString(color, alpha)
  }

  const alpha = inferred || isHighlighted || isSelected ? 0.1 : filter.opacity / 100.0
  return rgbaString(color, alpha)
}
