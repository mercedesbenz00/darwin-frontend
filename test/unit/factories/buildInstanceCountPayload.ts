import { InstanceCountReportPayload } from '@/store/types'

type Params = Partial<InstanceCountReportPayload>

export const buildInstanceCountPayload = (params: Params = {}): InstanceCountReportPayload => ({
  running_session_id: 'this-id-has-not-been-set',
  instance_count_cpu: 0,
  instance_count_gpu: 0,
  date: new Date().toISOString(),
  ...params
})
