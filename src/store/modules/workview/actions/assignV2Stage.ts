import { WorkviewAction } from '@/store/modules/workview/types'
import { MembershipPayload } from '@/store/types'
import { V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { sendV2Commands } from '@/utils/backend'

type Payload = {
  stage: V2WorkflowStagePayload,
  member: MembershipPayload
}

export const assignV2Stage: WorkviewAction<Payload, void> =
  async ({ commit, state }, { stage, member }) => {
    if (!state.dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }

    if (!state.v2WorkflowItemState) { throw new Error('Item state not loaded') }

    const params: Parameters<typeof sendV2Commands>[0] = {
      datasetItemId: state.selectedDatasetItemV2Id,
      teamSlug: state.dataset.team_slug,
      commands: [
        {
          type: 'assign',
          data: {
            assignee_id: member.user_id,
            stage_id: stage.id
          }
        }
      ]
    }
    const response = await sendV2Commands(params)

    if ('data' in response) {
      return { data: undefined }
    } else {
      commit('SET_ERROR', response.error)
      return { error: response.error }
    }
  }
