import { AttributePayload } from '@/store/types'

type Params = Partial<AttributePayload>

export const buildAttributePayload = (params: Params): AttributePayload => ({
  id: 'none',
  class_id: -1,
  color: 'rgba(0,0,0,0)',
  name: 'attribute',
  ...params
})
