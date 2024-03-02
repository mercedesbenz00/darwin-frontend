import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildV2DARCWorkflow
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { LayerBar } from 'test/unit/stubs'
import { emitRootStub } from 'test/unit/testHelpers'

import { VirtualDraggableList } from '@/components/Common/VirtualDraggableList'
import WorkflowLayerBar from '@/components/WorkView/LayerBar/WorkflowLayerBar'
import WorkflowLayerBarExpansionPanels from '@/components/WorkView/LayerBar/WorkflowLayerBar/WorkflowLayerBarExpansionPanels.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { AnnotateStagePayload, ReviewStagePayload } from '@/store/types'

const localVue = createLocalVue()

localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: {
  // actually required by the component, but we want to instantiate it in every test
  // AFTER setup mutations
  editor?: Editor
  readonly?: boolean
  isCopyAnnotationsEnabled: boolean
  shouldRenderAnnotations: boolean
  shouldRenderSubAnnotations: boolean
}

const stubs = {
  LayerBar,
  WorkflowLayerBarExpansionPanels,
  VirtualDraggableList
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    readonly: false,
    isCopyAnnotationsEnabled: true,
    shouldRenderAnnotations: true,
    shouldRenderSubAnnotations: true
  }
  const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 1 })
  store.commit('dataset/SET_DATASETS', [dataset])
  const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', myDatasetDetails)
})

describe('when reviewers can annotate', () => {
  const item = initializeARWorkflow({ id: 1 })
  const reviewStage = item.current_workflow!.stages[2][0] as ReviewStagePayload
  reviewStage.template_metadata.readonly = false

  beforeEach(() => {
    item.current_workflow!.current_workflow_stage_template_id =
      reviewStage.workflow_stage_template_id

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', reviewStage)

    const annotations = [
      buildStageAnnotationPayload({ id: 'first', workflow_stage_id: reviewStage.id, z_index: 2 }),
      buildStageAnnotationPayload({ id: 'second', workflow_stage_id: reviewStage.id, z_index: 1 }),
      buildStageAnnotationPayload({ id: 'third', workflow_stage_id: reviewStage.id, z_index: 3 })
    ]
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: reviewStage, annotations })
  })

  it('matches snapshot when empty and copy allowed', () => {
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: reviewStage, annotations: [] })
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('moves up the selected annotation when `move-up` is triggered', () => {
    const selectedAnnotation = store.state.workview.stageAnnotations[0]
    store.commit('workview/SELECT_ANNOTATION', selectedAnnotation.id)
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    emitRootStub(wrapper, 'move-up')
    expect(store.dispatch).toBeCalledWith('workview/updateStageAnnotationZIndex', {
      annotation: selectedAnnotation,
      zIndex: 3
    })
  })

  it('never moves up the selected annotation when it has highest priority', () => {
    const selectedAnnotation = store.state.workview.stageAnnotations[2]
    store.commit('workview/SELECT_ANNOTATION', selectedAnnotation.id)
    propsData.editor = new Editor(new ItemManager(store), store)
    jest.clearAllMocks()
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    emitRootStub(wrapper, 'move-up')
    expect(store.dispatch).not.toBeCalled()
  })

  it('moves down the selected annotation when `move-down` is triggered', () => {
    const selectedAnnotation = store.state.workview.stageAnnotations[0]
    store.commit('workview/SELECT_ANNOTATION', selectedAnnotation.id)
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    emitRootStub(wrapper, 'move-down')
    expect(store.dispatch).toBeCalledWith('workview/updateStageAnnotationZIndex', {
      annotation: selectedAnnotation,
      zIndex: 1
    })
  })

  it('never moves down the selected annotation when it has lowest priority', () => {
    const selectedAnnotation = store.state.workview.stageAnnotations[1]
    store.commit('workview/SELECT_ANNOTATION', selectedAnnotation.id)
    propsData.editor = new Editor(new ItemManager(store), store)
    jest.clearAllMocks()
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    emitRootStub(wrapper, 'move-down')
    expect(store.dispatch).not.toBeCalled()
  })

  it('triggers scroll to item when selection change in the bottom', async () => {
    const selectedAnnotation = store.state.workview.stageAnnotations[0]
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    const virtualDraggableList = wrapper.findComponent(VirtualDraggableList)
    const scrollToSpy = jest.spyOn(virtualDraggableList.vm as any, 'scrollTo')

    store.commit('workview/SELECT_ANNOTATION', selectedAnnotation)
    await wrapper.vm.$nextTick()
    expect(scrollToSpy).toHaveBeenCalled()
  })
})

describe('when reviewers cannot annotate', () => {
  beforeEach(() => {
    const item = initializeARWorkflow({ id: 1 })
    propsData.readonly = true

    const reviewStage = item.current_workflow!.stages[2][0] as ReviewStagePayload
    reviewStage.template_metadata.readonly = true

    item.current_workflow!.current_workflow_stage_template_id =
      reviewStage.workflow_stage_template_id

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', reviewStage)

    const annotations = [
      buildStageAnnotationPayload({ id: 'first', workflow_stage_id: reviewStage.id, z_index: 2 }),
      buildStageAnnotationPayload({ id: 'second', workflow_stage_id: reviewStage.id, z_index: 1 }),
      buildStageAnnotationPayload({ id: 'third', workflow_stage_id: reviewStage.id, z_index: 3 })
    ]
    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage: reviewStage, annotations })
  })

  it('matches snapshot when empty and copy allowed', async () => {
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })

    await flushPromises()

    expect(wrapper).toMatchSnapshot()
  })
})

describe('when workflows V1', () => {
  beforeEach(() => {
    const item = initializeARWorkflow({ id: 1 })
    const stage = item.current_workflow!.stages[1][0] as AnnotateStagePayload

      item.current_workflow!.current_workflow_stage_template_id =
        stage.workflow_stage_template_id

      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

      const annotations = [
        buildStageAnnotationPayload({ id: 'first', workflow_stage_id: stage.id, z_index: 1 })
      ]
      store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })
  })

  it('displays the annotations if stageInstance is available', () => {
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    expect(wrapper.findAll('layer-bar-item-stub')).toHaveLength(1)
  })

  it('doesn\'t display annotations if stageInstance is not available', () => {
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', null)
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    expect(wrapper.findAll('layer-bar-item-stub')).toHaveLength(0)
  })
})

describe('when workflows V2', () => {
  beforeEach(() => {
    const workflow = buildV2DARCWorkflow()
    const stage = workflow.stages[1]
    const item = buildDatasetItemPayload({ id: 1, dataset_id: workflow.dataset?.id })

    store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

    // Set WF1.0 selected stage instance just as a control - to make sure it is not
    // affecting WF2.0
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)

    // Set WF2.0 selected stage instance
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', stage)

    const annotations = [
      buildStageAnnotationPayload({ id: 'first', z_index: 1 })
    ]

    store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })

    const dataset = buildDatasetPayload({ id: 1, slug: 'test', version: 2 })
    store.commit('dataset/SET_DATASETS', [dataset])
  })

  it('displays the annotations if v2StageInstance is available', () => {
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    expect(wrapper.findAll('layer-bar-item-stub')).toHaveLength(1)
  })

  it('doesn\'t display annotations if v2StageInstance is not available', () => {
    store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
    propsData.editor = new Editor(new ItemManager(store), store)
    const wrapper = shallowMount(WorkflowLayerBar, { localVue, propsData, store, stubs })
    expect(wrapper.findAll('layer-bar-item-stub')).toHaveLength(0)
  })
})
