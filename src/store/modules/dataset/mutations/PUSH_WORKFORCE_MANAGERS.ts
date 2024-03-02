import { DatasetMutation } from '@/store/modules/dataset/types'
import { WorkforceManagerPayload } from '@/store/types/WorkforceManagerPayload'

export const PUSH_WORKFORCE_MANAGERS: DatasetMutation<WorkforceManagerPayload[]> =
  (state, data) => {
    if (data.length === 0) { return }
    const first = data[0]
    state.workforceManagers = state.workforceManagers
      .filter(m => m.dataset_id !== first.dataset_id)
      .concat(data)
      .sort((a, b) => a.id - b.id)
  }
