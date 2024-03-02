import { AnnotationCreditPayload } from '@/store/types'

type Params = Partial<AnnotationCreditPayload>

export const buildAnnotationCreditPayload =
  (params: Params): AnnotationCreditPayload => ({
    amount_billed: -1,
    amount_used: -1,
    expires_at: '2000-01-01T00:00:00',
    id: -1,
    inserted_at: '2000-01-01T00:00:00',
    note: null,
    team_id: -1,
    updated_at: '2000-01-01T00:00:00',
    ...params
  })
