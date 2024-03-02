import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

export type PresetPayload = {
  /* eslint-disable camelcase */
  id?: number
  name: string
  keys: string []
  manipulation: ImageManipulationFilter
  /* eslint-enable camelcase */
}
