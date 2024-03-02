import { round } from 'lodash'

import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { RGBA, rgbaString } from '@/utils'

export const strokeStyle = (
  color: RGBA,
  filter: ImageManipulationFilter | null,
  inferred: boolean,
  isSelected: boolean
): string => {
  if (!filter) {
    const alpha = inferred || isSelected ? 1 : 0.5
    return rgbaString(color, alpha)
  }

  const alpha = round(filter.borderOpacity / 100.0, 2)
  return rgbaString(color, alpha)
}
