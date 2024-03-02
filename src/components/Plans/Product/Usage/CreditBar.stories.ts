import { CreditUsagePayload } from '@/store/types'

import CreditBar from './CreditBar.vue'

const stories = {
  title: 'Billing/Plans/CreditBar'
}

export default stories

export const ZeroUsage = () => {
  const creditUsage: CreditUsagePayload = {
    clients: [],
    period_end: '1_590_969_600',
    period_start: '1_588_291_200',
    remaining_hours: 100,
    team_id: 1,
    total_available_hours: 100,
    total_client_used_hours: 0,
    total_used_hours: 0,
    used_automation_hours: 0,
    used_human_hours: 0,
    used_model_hours: 0
  }

  return {
    components: { CreditBar },
    data () { return { creditUsage } },
    template: '<credit-bar :credit-usage="creditUsage" />'
  }
}

export const SomeUsage = () => {
  const creditUsage: CreditUsagePayload = {
    clients: [],
    period_end: '1_590_969_600',
    period_start: '1_588_291_200',
    remaining_hours: 50,
    team_id: 1,
    total_available_hours: 100,
    total_client_used_hours: 0,
    total_used_hours: 60,
    used_automation_hours: 30,
    used_human_hours: 20,
    used_model_hours: 10
  }

  return {
    components: { CreditBar },
    data () { return { creditUsage } },
    template: '<credit-bar :credit-usage="creditUsage" />'
  }
}

export const FullUsage = () => {
  const creditUsage: CreditUsagePayload = {
    clients: [],
    period_end: '1_590_969_600',
    period_start: '1_588_291_200',
    remaining_hours: 0,
    team_id: 1,
    total_available_hours: 100,
    total_client_used_hours: 0,
    total_used_hours: 100,
    used_automation_hours: 60,
    used_human_hours: 30,
    used_model_hours: 10
  }

  return {
    components: { CreditBar },
    data () { return { creditUsage } },
    template: '<credit-bar :credit-usage="creditUsage" />'
  }
}

export const PartnerUsage = () => {
  const creditUsage: CreditUsagePayload = {
    clients: [],
    period_end: '1_590_969_600',
    period_start: '1_588_291_200',
    remaining_hours: 0,
    team_id: 1,
    total_available_hours: 100,
    total_client_used_hours: 30,
    total_used_hours: 70,
    used_automation_hours: 10,
    used_human_hours: 20,
    used_model_hours: 10
  }

  return {
    components: { CreditBar },
    data () { return { creditUsage } },
    template: '<credit-bar :credit-usage="creditUsage" />'
  }
}
