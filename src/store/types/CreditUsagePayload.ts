export type CreditUsagePayload = {
  /* eslint-disable camelcase */
  clients: CreditUsagePayload[]
  period_start: string
  period_end: string
  remaining_hours: number
  team_id: number
  total_available_hours: number
  total_client_used_hours: number
  total_used_hours: number
  used_automation_hours: number
  used_human_hours: number
  used_model_hours: number
  /* eslint-enable camelcase */
}

export type TickActionTypes =
  'export' |
  'api_call' |
  'model_stage' |
  'labeling_stage' |
  'annotation_time' |
  'auto_annotate' |
  'annotation' |
  'model_tool' |
  'consensus_stage'

export type TickPayload = {
  /* eslint-disable camelcase */
  action: TickActionTypes
  price_per_action_cents: number
  price_per_action: number
  team_id: CreditUsagePayloadV2['team_id']
  tick_cost: number
  /* eslint-enable camelcase */
}

export type CreditUsagePayloadV2 = {
  /* eslint-disable camelcase */
  clients: CreditUsagePayloadV2[]
  ticks: TickPayload[]
  period_end: number
  period_start: number
  remaining_credits: number
  team_id: number
  ticks_count: number
  total_credits: number
  used_credits: number
  /* eslint-enable camelcase */
}
