import { DEFAULT_IMAGE_MANIPULATION_FILTER } from '@/engineCommon/imageManipulation'
import { PresetPayload } from '@/store/types'

export const buildPresetPayload = (params: Partial<PresetPayload>): PresetPayload => ({
  id: 1,
  name: 'Preset 1',
  keys: [],
  manipulation: DEFAULT_IMAGE_MANIPULATION_FILTER,
  ...params
})
