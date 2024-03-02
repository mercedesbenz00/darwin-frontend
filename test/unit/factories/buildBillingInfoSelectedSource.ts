import { BillingInfoPayload } from '@/store/modules/billing/types'

type Params = Partial<BillingInfoPayload['selected_source']>

export const buildBillingInfoSelectedSource = (params?: Params): BillingInfoPayload['selected_source'] => ({
  id: '1',
  brand: 'brand',
  category: 'source',
  last4: '1234',
  type: 'credit-card',
  ...params
})
