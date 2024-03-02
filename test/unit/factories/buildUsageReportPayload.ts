import { UsageReportPayload } from '@/store/modules/billing/types'

type Params = Partial<UsageReportPayload>

export const buildUsageReportPayload =
  (params: Params = {}): UsageReportPayload => ({
    annotations: 0,
    application_calls: 0,
    applications: 0,
    images_used_in_training: 0,
    images: 0,
    models: 0,
    ...params
  })
