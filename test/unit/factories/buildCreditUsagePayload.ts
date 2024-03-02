import { CreditUsagePayload, CreditUsagePayloadV2 } from '@/store/types'

type Params = Partial<CreditUsagePayload>

export const buildCreditUsagePayload = (params: Params = {}): CreditUsagePayload => ({
  clients: [],
  period_end: '1_590_969_600',
  period_start: '1_588_291_200',
  remaining_hours: 40,
  team_id: -1,
  total_available_hours: 100,
  total_client_used_hours: 0,
  total_used_hours: 60,
  used_automation_hours: 20,
  used_human_hours: 30,
  used_model_hours: 10,
  ...params
})

type ParamsV2 = Partial<CreditUsagePayloadV2>

export const buildCreditUsagePayloadV2 = (params: ParamsV2 = {}): CreditUsagePayloadV2 => ({
  clients: [],
  team_id: -1,
  ticks: [{
    action: 'api_call',
    price_per_action_cents: 1,
    price_per_action: 1,
    team_id: -1,
    tick_cost: 10
  }],
  remaining_credits: 10,
  used_credits: 10,
  total_credits: 10,
  period_end: 0,
  period_start: 0,
  ticks_count: 1,
  ...params
})
