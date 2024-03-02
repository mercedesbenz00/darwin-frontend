import { useStore } from '@/composables/useStore'
import { resetStore } from '@/store'
import {
  buildV2WorkflowStagePayload
} from '@/store/modules/V2Workflow/actions/buildV2WorkflowStagePayload'
import { StageType } from '@/store/types/StageType'
import { memberships } from '@/storybook/fixtures'
import { datasetDetails, datasets } from '@/storybook/fixtures/__mocks__/workflow/constants'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'
import { partnerTeam, polygonTeam, v7 } from '@/storybook/fixtures/teams'

export const emptyWorkflow = workflowBuilder({
  stages: [
    buildV2WorkflowStagePayload({
      id: '1',
      type: StageType.Dataset,
      config: {
        x: 2200,
        y: 2650,
        dataset_id: null,
        initial: true
      }
    })
  ]
})

export const setupEmpty = (): void => {
  resetStore()
  const store = useStore()
  store.commit('team/SET_TEAMS', [polygonTeam, partnerTeam])
  store.commit('team/SET_CURRENT_TEAM', v7)
  store.commit('team/SET_MEMBERSHIPS', Object.values(memberships))
  store.commit('v2Workflow/SET_WORKFLOW', emptyWorkflow)
  store.commit('dataset/SET_DATASETS', datasets)

  datasetDetails.forEach((dd) => {
    store.commit('dataset/PUSH_DATASET_DETAILS', dd)
  })
}
