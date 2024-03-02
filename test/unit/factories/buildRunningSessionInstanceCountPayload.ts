import { RunningSessionInstanceCountPayload } from '@/store/types'

type Params = Partial<RunningSessionInstanceCountPayload>
type Factory = (params: Params) => RunningSessionInstanceCountPayload

export const buildRunningSessionInstanceCountPayload: Factory = (params = {}) => ({
  available: 0,
  initiating: 0,
  loading: 0,
  reported_for: '2020-01-01T00:00:00',
  running_session_id: 'fake-id',
  scheduled: 0,
  starting: 0,
  stopped: 0,
  stopping: 0,
  ...params
})
