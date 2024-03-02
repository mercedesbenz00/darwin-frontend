import { ClassUsagePayload } from '@/store/types'

type Params = Partial<ClassUsagePayload>

export const buildClassUsagePayload = (params: Params = {}): ClassUsagePayload => ({
  usage: 5,
  ...params
})
