import { WorkviewAction } from '@/store/modules/workview/types'
import { StageType } from '@/store/types'
import { sendV2Commands } from '@/utils/backend'

export const restartV2WorkflowItem: WorkviewAction<void, void> =
  async ({ commit, state }) => {
    if (!state.dataset) { throw new Error('Dataset not set') }
    if (!state.selectedDatasetItemV2Id) { throw new Error('Item not set') }
    if (!state.v2WorkflowItemState) { throw new Error('Item state not loaded') }

    const stageInstance = state.v2WorkflowItemState.current_stage_instances.find(
      i => i.stage.type === StageType.Complete
    )

    if (!stageInstance) { throw new Error('Current stage is of wrong type') }

    const stage =
      state.v2WorkflowItemState.workflow.stages.find(s => 'initial' in s.config && s.config.initial)

    if (!stage) { throw new Error('Workflow has no initial stage') }

    const params: Parameters<typeof sendV2Commands>[0] = {
      datasetItemId: state.selectedDatasetItemV2Id,
      teamSlug: state.dataset.team_slug,
      commands: [
        {
          type: 'set_stage',
          data: {
            to_stage_id: stage.id
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
