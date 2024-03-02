export type InstanceCountReportPayload = {
  /* eslint-disable camelcase */
  date: string
  running_session_id: string | null
  instance_count_cpu: number
  instance_count_gpu: number
  /* eslint-enable camelcase */
}
