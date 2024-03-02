import { Country } from '@/store/modules/billing/types'

export const buildCountry = (params?: Partial<Country>): Country => ({
  alpha2: 'uk',
  name: 'UK',
  ...params
})
