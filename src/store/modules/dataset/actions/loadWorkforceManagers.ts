import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { WorkforceManagerPayload } from '@/store/types/WorkforceManagerPayload'
import { loadWorkforceManagers as request } from '@/utils/backend'

type Action = DatasetAction<DatasetPayload, WorkforceManagerPayload[]>

/**
 * Loads workforce managers for a dataset
 *
 * Note that this there are two records
 *
 * - a team membership associated with a team and a user, with the role "workforce_manager"
 * - a record associated with a user and a dataset
 *
 * The first record defines that the user can become a workforce manager in a
 * dataset owned by the team.
 *
 * The second record defines that the user has actually been assigned as
 * workforce manager on a dataset
 *
 * This action loads the second set of records.
 */
const loadWorkforceManagers: Action = async ({ commit }, dataset) => {
  const response = await request({ datasetId: dataset.id })

  if ('data' in response) { commit('PUSH_WORKFORCE_MANAGERS', response.data) }
  return response
}
export default loadWorkforceManagers
