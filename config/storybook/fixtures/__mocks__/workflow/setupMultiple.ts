import { buildEdgePayload } from 'test/unit/factories'

import { useStore } from '@/composables'
import { resetStore } from '@/store'
import { 
  buildV2WorkflowStagePayload 
} from '@/store/modules/V2Workflow/actions/buildV2WorkflowStagePayload'
import { StageType } from '@/store/types/StageType'
import { StageCoords } from '@/store/types/V2WorkflowStagePayload'
import { memberships } from '@/storybook/fixtures'
import { datasetDetails, datasets } from '@/storybook/fixtures/__mocks__/workflow/constants'
import { workflowBuilder } from '@/storybook/fixtures/__mocks__/workflow/workflow'
import { partnerTeam, polygonTeam } from '@/storybook/fixtures/teams'

export const baseWorkflow = workflowBuilder({
  stages: [
    buildV2WorkflowStagePayload({
      id: '1',
      type: StageType.Dataset,
      config: {
        x: 2200,
        y: 2650,
        dataset_id: 883,
        initial: true
      },
      edges: [
        buildEdgePayload({
          id: 'e-1',
          source_stage_id: '1',
          target_stage_id: '2'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '2',
      type: StageType.Annotate,
      config: {
        x: 2550,
        y: 2650,
        initial: false
      },
      edges: [
        buildEdgePayload({
          id: 'e-2',
          source_stage_id: '2',
          target_stage_id: '3'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '3',
      type: StageType.Review,
      assignable_users: [{ user_id: 21 }, { user_id: 22 }, { user_id: 14 }],
      config: {
        assignable_to: 'manual',
        x: 2950,
        y: 2650,
        initial: false
      },
      edges: [
        buildEdgePayload({
          id: 'e-3',
          name: 'approve',
          source_stage_id: '3',
          target_stage_id: '4'
        }),
        buildEdgePayload({
          id: 'e-4',
          name: 'reject',
          source_stage_id: '3',
          target_stage_id: '5'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '4',
      type: StageType.Complete,
      config: {
        x: 3300,
        y: 2650
      }
    }),
    buildV2WorkflowStagePayload({
      id: '5',
      type: StageType.Annotate,
      config: {
        x: 3300,
        y: 2950,
        initial: false
      }
    })
  ]
})

export const extendedWorkflow = workflowBuilder({
  id: 'extended-workflow',
  name: 'human-eye-scans',
  stages: [
    buildV2WorkflowStagePayload({
      id: '1',
      type: StageType.Dataset,
      config: {
        x: 2200,
        y: 2650,
        dataset_id: 883,
        initial: true
      },
      edges: [
        buildEdgePayload({
          id: 'e-1',
          source_stage_id: '1',
          target_stage_id: '2'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '2',
      type: StageType.Annotate,
      config: {
        x: 2550,
        y: 2650,
        initial: false
      },
      edges: [
        buildEdgePayload({
          id: 'e-2',
          source_stage_id: '2',
          target_stage_id: '3'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '3',
      type: StageType.Review,
      assignable_users: [{ user_id: 21 }, { user_id: 22 }, { user_id: 14 }],
      config: {
        assignable_to: 'manual',
        x: 2950,
        y: 2650,
        initial: false
      },
      edges: [
        buildEdgePayload({
          id: 'e-3',
          name: 'approve',
          source_stage_id: '3',
          target_stage_id: '4'
        }),
        buildEdgePayload({
          id: 'e-4',
          name: 'reject',
          source_stage_id: '3',
          target_stage_id: '5'
        })
      ]
    }),
    buildV2WorkflowStagePayload({
      id: '4',
      type: StageType.Complete,
      config: {
        x: 3300,
        y: 2650
      }
    })
  ]
})

export const setupMultiple = (baseCoords?: StageCoords): void => {
  resetStore()
  const store = useStore()
  store.commit('team/SET_TEAMS', [polygonTeam, partnerTeam])
  store.commit('team/SET_CURRENT_TEAM', polygonTeam)
  store.commit('team/SET_MEMBERSHIPS', Object.values(memberships))

  for (let i = 0; i < baseWorkflow.stages.length; i++) {
    baseWorkflow.stages[i].config = { ...baseWorkflow.stages[i].config, ...baseCoords }
  }
  /* Setup datasets and workflow */
  store.commit('v2Workflow/SET_WORKFLOW', baseWorkflow)
  store.commit('v2Workflow/SET_WORKFLOW', extendedWorkflow)
  store.commit('dataset/SET_DATASETS', datasets)

  datasetDetails.forEach((dd) => {
    store.commit('dataset/PUSH_DATASET_DETAILS', dd)
  })
}
