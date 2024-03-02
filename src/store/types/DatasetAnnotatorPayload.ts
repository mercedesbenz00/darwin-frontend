import { UserPayload } from './UserPayload'

export type DatasetAnnotatorPayload = {
  /* eslint-disable camelcase */
  id: number
  dataset_id: number
  score: number
  user_id: number
  user: UserPayload
  /* eslint-enable camelcase */
}
