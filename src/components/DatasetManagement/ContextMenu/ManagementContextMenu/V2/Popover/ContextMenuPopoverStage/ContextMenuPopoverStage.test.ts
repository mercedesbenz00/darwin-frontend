import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore, { initializeStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildV2DARCWorkflow } from 'test/unit/factories'

import { StageType, V2DatasetStagePayload } from '@/store/types'

import ContextMenuPopoverStage from './ContextMenuPopoverStage.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let wrapper: Wrapper<Vue>
let store: ReturnType<typeof initializeStore>

const propsData = {
  show: true
}

const dataset = buildDatasetPayload({ id: 7 })
const workflow = buildV2DARCWorkflow()
const datasetStage =
  workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
datasetStage.config.dataset_id = 7

beforeEach(() => {
  store = createTestStore()
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  store.commit('dataset/SET_CURRENT_DATASET_ID', dataset.id)
})

afterEach(() => {
  wrapper.destroy()
})

it('should render properly', () => {
  wrapper = shallowMount(ContextMenuPopoverStage, { propsData, localVue, store })
  expect(wrapper.exists()).toBeTruthy()
})

it('should match snapshot', () => {
  wrapper = shallowMount(ContextMenuPopoverStage, { propsData, localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits action on discard click', () => {
  wrapper = shallowMount(ContextMenuPopoverStage, { propsData, localVue, store })
  wrapper.find('list-element-v2-stub[text="Discard annotations"]').vm.$emit('click')
  expect(wrapper.emitted()['discard-annotations']!.length).toEqual(1)
})

it('emits action on stage click', () => {
  wrapper = shallowMount(ContextMenuPopoverStage, { propsData, localVue, store })
  wrapper.find('list-element-v2-stub[text="Annotate"]').vm.$emit('click')
  expect(wrapper.emitted()['set-stage']![0][0])
    .toEqual(expect.objectContaining({ type: StageType.Annotate }))

  wrapper.find('list-element-v2-stub[text="Complete"]').vm.$emit('click')
  expect(wrapper.emitted()['set-stage']![1][0])
    .toEqual(expect.objectContaining({ type: StageType.Complete }))
})

it('sorts by workflow flow', async () => {
  const temp = { ...workflow.stages[0] }
  workflow.stages[0] = { ...workflow.stages[workflow.stages.length - 1] }
  workflow.stages[workflow.stages.length - 1] = temp
  store.commit('v2Workflow/SET_WORKFLOWS', [workflow])

  wrapper = shallowMount(ContextMenuPopoverStage, { propsData, localVue, store })
  await expect(
    wrapper.findAll('list-element-v2-stub').at(0).attributes('text')
  ).toBe(
    workflow.stages[workflow.stages.length - 1].name
  )
})
