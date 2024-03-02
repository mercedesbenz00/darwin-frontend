import { V2WorkflowPayload, V2WorkflowStagePayload, DatasetStageConfigPayload, ConsensusStageConfigPayload } from '@/store/types'
import { cloneWorkflow } from '@/views/datasets/utils/cloneWorkflow'

describe('cloneWorkflow', () => {
  it('should clone a workflow', () => {
    const workflow = {
      dataset: {
        annotation_hotkeys: {},
        id: 26,
        instructions: '',
        name: 'blaahhh'
      },
      id: '9bc624c3-1aaf-4d5c-9d16-a660ad45187d',
      inserted_at: '2022-06-02T13:23:42',
      name: 'Basic workflow',
      config: {},
      progress: { complete: 0, idle: 3, in_progress: 0, total: 3 },
      stages: [
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: 26,
            initial: true,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 2942,
            y: 2896
          },
          edges: [
            {
              id: '1a7b43b0-0be3-4de2-91e7-6a55c173d31f',
              name: 'default',
              source_stage_id: 'f8d2371d-78bc-47ff-b28f-2e3c4fa2fa11',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2'
            }
          ],
          id: 'f8d2371d-78bc-47ff-b28f-2e3c4fa2fa11',
          name: 'Dataset',
          type: 'dataset'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 3330,
            y: 2896
          },
          edges: [
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'default',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
              target_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f'
            }
          ],
          id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
          name: 'Annotate',
          type: 'annotate'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 3746,
            y: 2896
          },
          edges: [
            {
              id: '34001807-ad1d-4eaa-80dc-e7d6012de8b3',
              name: 'approve',
              source_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f',
              target_stage_id: '3029ba12-529a-4508-8e3e-78f35fca27f7'
            },
            {
              id: '9a1f342f-785c-461c-8a08-55b8d35ab7e6',
              name: 'reject',
              source_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2'
            }
          ],
          id: '5115cc7c-0680-436d-94de-30ce8430093f',
          name: 'Review',
          type: 'review'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 4061,
            y: 2896
          },
          edges: [],
          id: '3029ba12-529a-4508-8e3e-78f35fca27f7',
          name: 'Complete',
          type: 'complete'
        },
        {
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 1,
            y: 2
          },
          edges: [],
          id: '2904c80e-1d39-4b85-b7eb-c967327f1321',
          name: 'Discard',
          type: 'discard'
        } as V2WorkflowStagePayload
      ],
      team_id: 1,
      thumbnails: [],
      updated_at: '2022-06-02T13:23:46'
    } as V2WorkflowPayload

    const clone = cloneWorkflow({
      workflow,
      datasetId: 30,
      workflowName: 'test'
    })
    expect(clone.id).not.toEqual(workflow.id)
    expect(clone.name).toEqual('test')
    expect((
      clone.stages.find(s => s.type === 'dataset')?.config as DatasetStageConfigPayload
    ).dataset_id).toEqual(30)
    expect(clone.stages.find(s => s.type === 'discard')).toBeUndefined()
  })

  it('should assign correct ids for parallel and test stages of consensus', () => {
    const workflow = {
      dataset: {
        annotation_hotkeys: {},
        id: 26,
        instructions: '',
        name: 'blaahhh'
      },
      id: '9bc624c3-1aaf-4d5c-9d16-a660ad45187d',
      inserted_at: '2022-06-02T13:23:42',
      name: 'Basic workflow',
      config: {},
      progress: { complete: 0, idle: 3, in_progress: 0, total: 3 },
      stages: [
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: 26,
            initial: true,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 2942,
            y: 2896
          },
          edges: [
            {
              id: '1a7b43b0-0be3-4de2-91e7-6a55c173d31f',
              name: 'default',
              source_stage_id: 'f8d2371d-78bc-47ff-b28f-2e3c4fa2fa11',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2'
            }
          ],
          id: 'f8d2371d-78bc-47ff-b28f-2e3c4fa2fa11',
          name: 'Dataset',
          type: 'dataset'
        },
        {
          assignable_users: [],
          config: {
            parallel_stage_ids: ['2e07f525-be65-4a0d-8e3a-87ef8e970001', '2e07f525-be65-4a0d-8e3a-87ef8e970002'],
            test_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e970003',
            x: 3330,
            y: 2896
          },
          edges: [
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'parallel',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e970001'
            },
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'parallel',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e970002'
            }
          ],
          id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
          name: 'Consensus',
          type: 'consensus_entrypoint'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 3330,
            y: 2896
          },
          edges: [
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'default',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
              target_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f'
            }
          ],
          id: '2e07f525-be65-4a0d-8e3a-87ef8e970001',
          name: 'Annotate (1)',
          type: 'annotate'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 3330,
            y: 2896
          },
          edges: [
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'default',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2',
              target_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f'
            }
          ],
          id: '2e07f525-be65-4a0d-8e3a-87ef8e970002',
          name: 'Annotate (2)',
          type: 'annotate'
        },
        {
          config: {
            x: 3330,
            y: 2896
          },
          edges: [
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a55',
              name: 'approve',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e970003',
              target_stage_id: '3029ba12-529a-4508-8e3e-78f35fca27f7'
            },
            {
              id: 'cb156931-8f3d-4d7e-847f-423a3b305a56',
              name: 'reject',
              source_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e970003',
              target_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f'
            }
          ],
          id: '2e07f525-be65-4a0d-8e3a-87ef8e970003',
          name: 'Consensus Test',
          type: 'consensus_test'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 3746,
            y: 2896
          },
          edges: [
            {
              id: '34001807-ad1d-4eaa-80dc-e7d6012de8b3',
              name: 'approve',
              source_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f',
              target_stage_id: '3029ba12-529a-4508-8e3e-78f35fca27f7'
            },
            {
              id: '9a1f342f-785c-461c-8a08-55b8d35ab7e6',
              name: 'reject',
              source_stage_id: '5115cc7c-0680-436d-94de-30ce8430093f',
              target_stage_id: '2e07f525-be65-4a0d-8e3a-87ef8e972cf2'
            }
          ],
          id: '5115cc7c-0680-436d-94de-30ce8430093f',
          name: 'Review',
          type: 'review'
        },
        {
          assignable_users: [],
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 4061,
            y: 2896
          },
          edges: [],
          id: '3029ba12-529a-4508-8e3e-78f35fca27f7',
          name: 'Complete',
          type: 'complete'
        },
        {
          config: {
            assignable_to: 'anyone',
            auto_instantiate: false,
            class_mapping: [],
            dataset_id: null,
            initial: false,
            model_id: null,
            readonly: false,
            skippable: false,
            x: 1,
            y: 2
          },
          edges: [],
          id: '2904c80e-1d39-4b85-b7eb-c967327f1321',
          name: 'Discard',
          type: 'discard'
        } as V2WorkflowStagePayload
      ],
      team_id: 1,
      thumbnails: [],
      updated_at: '2022-06-02T13:23:46'
    } as V2WorkflowPayload

    const clone = cloneWorkflow({
      workflow,
      datasetId: 30,
      workflowName: 'test'
    })
    const config = clone.stages.find(s => s.type === 'consensus_entrypoint')?.config as ConsensusStageConfigPayload
    expect([...config.parallel_stage_ids].sort()).toEqual(clone.stages.filter((s) => s.type == 'annotate').map(s => s.id).sort())
    expect([...config.parallel_stage_ids].sort()).not.toEqual((workflow.stages.find((s) => s.type == 'consensus_entrypoint')?.config as ConsensusStageConfigPayload).parallel_stage_ids)
    expect(config.test_stage_id).toEqual(clone.stages.find((s) => s.type == 'consensus_test')?.id)
    expect(config.test_stage_id).not.toEqual(workflow.stages.find((s) => s.type == 'consensus_test')?.id)
  })
})
