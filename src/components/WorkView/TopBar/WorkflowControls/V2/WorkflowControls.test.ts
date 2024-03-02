import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import { ref } from 'vue'
import Vuex from 'vuex'

import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowItemPayload,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import { StageType } from '@/store/types'

import { V2WorkflowControls } from '.'

jest.mock('@/composables/useEditorV2/useViewReadonly')
jest.mock('@/engineV2/workers/FramesLoaderWorker')

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

const workflow = buildV2DARCWorkflow()
const dataset = workflow.stages.find(s => s.type === StageType.Dataset)
const annotate = workflow.stages.find(s => s.type === StageType.Annotate)
const review = workflow.stages.find(s => s.type === StageType.Review)
const complete = workflow.stages.find(s => s.type === StageType.Complete)
const discard = workflow.stages.find(s => s.type === StageType.Discard)
const webhook = workflow.stages.find(s => s.type === StageType.Webhook)

const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [],
  workflow
})

const itemPayload = buildV2WorkflowItemPayload({
  current_stage_instances: [],
  workflow
})

const datasetItem = buildDatasetItemPayload({
  current_workflow: null,
  workflow_item: itemPayload
})

let provide: any

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_SELECTED_DATASET_ITEM', datasetItem)

  provide = {
    editorV2: ref(createEditorV2(store))
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(V2WorkflowControls, { localVue, store, provide })
  expect(wrapper).toMatchSnapshot()
})

describe('in current dataset stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: dataset })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in current annotate stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: annotate })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in current review stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: review })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in current complete stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: complete })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in current discard stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: discard })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in current webhook stage', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: webhook })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
    store.commit('workview/SET_V2_SELECTED_STAGE', instance.stage)
  })

  itMatchesSnapshot()
})

describe('in time travel', () => {
  beforeEach(() => {
    const instance = buildV2WorkflowStageInstancePayload({ stage: annotate })
    itemState.current_stage_instances = [instance]
    store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
    store.commit('workview/SET_V2_SELECTED_STAGE', review)
  })

  itMatchesSnapshot()
})

describe('in new item', () => {
  beforeEach(() => {
    store.commit('workview/SET_SELECTED_DATASET_ITEM', { ...datasetItem, workflow_item: null })
  })

  itMatchesSnapshot()

  it('renders redirect button to workflows page', () => {
    const wrapper = shallowMount(V2WorkflowControls, { localVue, store, provide })
    expect(wrapper).toMatchSnapshot()
  })
})
