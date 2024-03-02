import { InferenceRequestCountPayload } from '@/store/types'

type Params = Partial<InferenceRequestCountPayload>

export const buildInferenceRequestCountPayload = (
  params: Params = {}
): InferenceRequestCountPayload => ({
  running_session_id: 'this-id-has-not-been-set',
  request_count: 0,
  success_count: 0,
  failure_count: 0,
  date: new Date().toISOString(),
  ...params
})
