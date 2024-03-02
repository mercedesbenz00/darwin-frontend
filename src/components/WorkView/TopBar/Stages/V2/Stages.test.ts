import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2DARCWorkflow,
  buildLoopedV2DARRCWorkflow,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'
import { VPopover } from 'test/unit/stubs'

import {
  StageType,
  V2AnnotateStagePayload,
  V2DatasetStagePayload,
  V2InstanceStatus,
  V2ReviewStagePayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload
} from '@/store/types'

import { V2Stages } from '.'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  stage: V2WorkflowStagePayload
  instance?: V2WorkflowStageInstancePayload
}

const mocks = { $can: (): boolean => true }
const stubs = { 'v-popover': VPopover }

class PageModel extends Model {
  get renderedStages (): V2WorkflowStagePayload[] {
    return this.wrapper.findAll('v2-stage-item-stub').wrappers.map(w => w.props('stage'))
  }
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(V2Stages, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('with active workflow and ARC workflow', () => {
  const workflow = buildV2DARCWorkflow()
  const dataset = buildDatasetPayload({ id: 9 })

  const datasetStage = workflow.stages
    .find(s => s.id === 'dataset') as V2DatasetStagePayload
  datasetStage.config.dataset_id = dataset.id
  const annotateStage = workflow.stages
    .find(s => s.id === 'annotate')! as V2AnnotateStagePayload
  const reviewStage = workflow.stages
    .find(s => s.id === 'review')! as V2ReviewStagePayload

  // this is an ARC workflow which had a review rejection
  // A -> R -> A -> R and next stage is C
  const itemState = buildV2WorkflowItemStatePayload({
    workflow,
    previous_stage_instances: [
      buildV2WorkflowStageInstancePayload({
        id: 'a',
        stage: datasetStage,
        status: V2InstanceStatus.Completed
      }),
      buildV2WorkflowStageInstancePayload({
        id: 'b',
        stage: annotateStage,
        status: V2InstanceStatus.Completed
      }),
      buildV2WorkflowStageInstancePayload({
        id: 'c',
        stage: reviewStage,
        status: V2InstanceStatus.Completed
      })
    ],
    current_stage_instances: [
      buildV2WorkflowStageInstancePayload({
        id: 'd',
        stage: reviewStage
      })
    ]
  })

  beforeEach(() => {
    store = createTestStore()
    store.commit('workview/SET_V2_WORKFLOWS', [workflow])
    store.commit('workview/SET_DATASET', dataset)
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
  })

  itMatchesSnapshot()

  it('renders component for every past instance + current instance', () => {
    const wrapper = shallowMount(V2Stages, { localVue, mocks, propsData, store, stubs })
    const model = new PageModel(wrapper)
    // [PAST]>[CURRENT]>[FUTURE]
    // [A > R > A]>[A]>[C]
    expect(model.renderedStages.length).toEqual(4)
  })
})

describe('with active workflow and looped ARRC workflow', () => {
  const workflow = buildLoopedV2DARRCWorkflow()
  const dataset = buildDatasetPayload({ id: 9 })

  const datasetStage = workflow.stages
    .find(s => s.id === 'dataset') as V2DatasetStagePayload
  datasetStage.config.dataset_id = dataset.id
  const annotateStage = workflow.stages
    .find(s => s.id === 'annotate')! as V2AnnotateStagePayload
  const review1Stage = workflow.stages
    .find(s => s.id === 'review-1')! as V2ReviewStagePayload
  const review2Stage = workflow.stages
    .find(s => s.id === 'review-2')! as V2ReviewStagePayload

  // this is a ARRC workflow which had 2 looped review rejections
  // A -> R -> R -> A and next stage is C
  const itemState = buildV2WorkflowItemStatePayload({
    workflow,
    previous_stage_instances: [
      buildV2WorkflowStageInstancePayload({
        id: 'a',
        stage: datasetStage,
        status: V2InstanceStatus.Completed
      }),
      buildV2WorkflowStageInstancePayload({
        id: 'b',
        stage: annotateStage,
        status: V2InstanceStatus.Completed
      }),
      buildV2WorkflowStageInstancePayload({
        id: 'c',
        stage: review1Stage,
        status: V2InstanceStatus.Completed
      }),
      buildV2WorkflowStageInstancePayload({
        id: 'd',
        stage: review2Stage,
        status: V2InstanceStatus.Completed
      }),
    ],
    current_stage_instances: [
      buildV2WorkflowStageInstancePayload({
        id: 'e',
        stage: review2Stage
      })
    ]
  })

  beforeEach(() => {
    store = createTestStore()
    store.commit('workview/SET_V2_WORKFLOWS', [workflow])
    store.commit('workview/SET_DATASET', dataset)
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
  })

  // itMatchesSnapshot()

  it('renders component for every past instance + current instance', () => {
    const wrapper = shallowMount(V2Stages, { localVue, mocks, propsData, store, stubs })
    const model = new PageModel(wrapper)
    // [PAST]>[CURRENT]>[FUTURE]
    // [A > R > R > A]>[A]>[C]
    expect(model.renderedStages.length).toEqual(5)
  })
})

describe('without active workflow', () => {
  const workflow = buildV2DARCWorkflow()
  const dataset = buildDatasetPayload({ id: 9 })

  const datasetStage =
    workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
  datasetStage.config.dataset_id = dataset.id

  beforeEach(() => {
    store = createTestStore()
    store.commit('workview/SET_V2_WORKFLOWS', [workflow])
    store.commit('workview/SET_DATASET', dataset)
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
  })

  itMatchesSnapshot()

  it('renders a flat list of stages', () => {
    const wrapper = shallowMount(V2Stages, { localVue, mocks, propsData, store, stubs })
    const model = new PageModel(wrapper)
    expect(model.renderedStages.length).toEqual(4)
  })
})
