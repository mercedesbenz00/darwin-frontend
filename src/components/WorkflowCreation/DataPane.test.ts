import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowPayload
} from 'test/unit/factories'

import { useWorkflowSceneStore } from '@/composables/useWorkflowSceneStore'
import { StageType, V2DatasetStagePayload } from '@/store/types'
import PanelFloatingWhite from '@/uiKit/Panel/PanelFloatingWhite.vue'

import DataPane from './DataPane.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(PiniaVuePlugin)

let pinia: ReturnType<typeof createTestingPinia>

let store: ReturnType<typeof createTestStore>

const PullBox = Vue.component('PullBox', {
  template: `
    <div>
      <slot />
    </div>
  `
})

const stubs = { PullBox, PanelFloatingWhite }

beforeEach(() => {
  pinia = createTestingPinia()
  store = createTestStore()
})

it('expands and collapses', async () => {
  const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
  expect(wrapper.element.classList.contains('data-pane--expanded')).toBe(false)

  await wrapper.find('ButtonBorderless-stub').vm.$emit('click')
  expect(wrapper.find('.panel.data-pane').element.classList
    .contains('data-pane--expanded')).toBe(true)
})

const workflow = buildV2DARCWorkflow()

const datasetStage =
  workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
datasetStage.config.dataset_id = 10

const dataset = buildDatasetPayload({ id: 10, name: 'DataPane Dataset' })

describe('when workflow has a dataset', () => {
  beforeEach(() => {
    store.commit('v2Workflow/SET_EDITED_WORKFLOW', workflow)
    store.commit('dataset/SET_DATASETS', [dataset])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders dataset name', () => {
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(wrapper.text()).toContain('DataPane Dataset')
  })

  it('sets current dataset id on store', async () => {
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(store.state.dataset.currentDataset.id).toEqual(10)

    const otherWorkflow = buildV2DARCWorkflow()
    otherWorkflow.id = 'other'
    const otherDataset = buildDatasetPayload({ id: 100, name: 'Other Dataset' })

    const datasetStage =
      otherWorkflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
    datasetStage.config.dataset_id = otherDataset.id

    store.commit('v2Workflow/SET_EDITED_WORKFLOW', otherWorkflow)
    store.commit('dataset/SET_DATASETS', [dataset, otherDataset])
    await wrapper.vm.$nextTick()

    expect(store.state.dataset.currentDataset.id).toEqual(100)
  })

  it('filters by selected stage', async () => {
    const scene = useWorkflowSceneStore()
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })

    scene.selectedStage = workflow.stages[0]
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilterV2', {
      workflow_stage_ids: [workflow.stages[0].id]
    })

    scene.selectedStage = workflow.stages[1]
    await wrapper.vm.$nextTick()
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilterV2', {
      workflow_stage_ids: [workflow.stages[1].id]
    })

    scene.selectedStage = null
    expect(store.dispatch).toHaveBeenCalledWith('dataset/setDatasetItemFilterV2', {})
  })

  it('matches snapshot when dataset page is selected', () => {
    const scene = useWorkflowSceneStore()
    scene.selectedStage = datasetStage
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('shows "Manage dataset" when dataset page is selected', async () => {
    const scene = useWorkflowSceneStore()
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })

    expect(wrapper.find('custombutton-stub[tag=router-link]').exists()).toBe(false)

    scene.selectedStage = datasetStage
    await wrapper.vm.$nextTick()
    expect(wrapper.find('togglebutton-stub[to]').exists()).toBe(true)

    scene.selectedStage = workflow.stages[1]
    await wrapper.vm.$nextTick()
    expect(wrapper.find('togglebutton-stub[to]').exists()).toBe(false)
  })
})

describe('when workflow has no dataset', () => {
  const emptyWorkflow = buildV2WorkflowPayload({ stages: [] })
  beforeEach(() => {
    store.commit('v2Workflow/SET_EDITED_WORKFLOW', emptyWorkflow)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders message', () => {
    const wrapper = shallowMount(DataPane, { localVue, pinia, store, stubs })
    expect(wrapper.text()).toContain('Connect a dataset to the workflow')
  })
})
