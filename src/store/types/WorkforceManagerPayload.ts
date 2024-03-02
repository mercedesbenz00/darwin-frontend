import { DatasetPayload } from './DatasetPayload'
import { InvitationPayload } from './InvitationPayload'
import { UserPayload } from './UserPayload'

/* eslint-disable camelcase */

export type WorkforceManagerPayload = {
  dataset_id: DatasetPayload['id']
  id: number
  invitation: Pick<InvitationPayload, 'id' | 'email'> | null
  user: Pick<UserPayload, 'id' | 'first_name' | 'last_name' | 'image'> | null
}

/* eslint-enable camelcase */
