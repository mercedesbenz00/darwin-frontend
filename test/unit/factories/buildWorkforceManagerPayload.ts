import { WorkforceManagerPayload } from '@/store/types/WorkforceManagerPayload'

type Params = Partial<WorkforceManagerPayload>

export const buildWorkforceManagerPayload = (params: Params): WorkforceManagerPayload => ({
  dataset_id: -1,
  id: -1,
  invitation: null,
  user: {
    id: -1,
    first_name: '',
    last_name: '',
    image: null
  },
  ...params
})
