import { FeaturePayload } from '@/store/types'

type Params = Partial<FeaturePayload>

export const buildFeaturePayload = (params: Params = {}): FeaturePayload => ({
  name: 'TEST_FEATURE',
  enabled: false,
  ...params
})
