import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildWorkflowTemplatePayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import Stages from '@/components/WorkView/TopBar/Stages/V1/Stages.vue'
import { WorkflowStageTemplatePayload } from '@/store/types'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.directive('tooltip', () => { })

let store: ReturnType<typeof createTestStore>
const mocks = { $theme: createMockTheme() }

beforeEach(() => { store = createTestStore() })

it('matches snapshot when no item', () => {
  const wrapper = shallowMount(Stages, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

const setupItemWithTemplate = (store: ReturnType<typeof createTestStore>) => {
  const item = buildDatasetItemPayload({ id: 1, dataset_id: 1 })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  const dataset = buildDatasetPayload({ id: 1, default_workflow_template_id: 1 })
  store.commit('workview/SET_DATASET', dataset)
  const template = buildWorkflowTemplatePayload({ id: 1, dataset_id: 1 })
  store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)
}

it('matches snapshot for item without a workflow', async () => {
  setupItemWithTemplate(store)
  const wrapper = shallowMount(Stages, { localVue, mocks, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

const setupActiveWorfklow = (store: ReturnType<typeof createTestStore>) => {
  const item = store.state.workview.selectedDatasetItem!
  const [template] = store.state.workview.workflowTemplates

  const updatedItem = initializeARWorkflow(item, template)
  store.commit('workview/PUSH_DATASET_ITEMS', [updatedItem])
  store.commit('workview/SET_SELECTED_DATASET_ITEM', updatedItem)
}

it('matches snapshot for item with a workflow', async () => {
  setupItemWithTemplate(store)
  setupActiveWorfklow(store)

  const wrapper = shallowMount(Stages, { localVue, mocks, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

describe('for item without a workflow', () => {
  beforeEach(() => {
    setupItemWithTemplate(store)
  })

  it('renders correct selection indicator', async () => {
    const [template] = store.state.workview.workflowTemplates
    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template.workflow_stage_templates[0])

    const wrapper = shallowMount(Stages, { localVue, mocks, store })
    await flushPromises()
    await wrapper.setData({
      stageDimensions: [
        { number: 1, left: 0, width: 30 },
        { number: 2, left: 30, width: 30 },
        { number: 3, left: 60, width: 30 }
      ]
    })

    expect(
      wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
    ).toEqual('15px')

    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template.workflow_stage_templates[2])
    await wrapper.vm.$nextTick()

    expect(
      wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
    ).toEqual('75px')

    store.commit('workview/SET_SELECTED_STAGE_TEMPLATE', template.workflow_stage_templates[1])
    await wrapper.vm.$nextTick()

    expect(
      wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
    ).toEqual('45px')
  })

  it('always renders templates in order', () => {
    const [template] = store.state.workview.workflowTemplates
    const unorderedTemplates = [
      template.workflow_stage_templates[2],
      template.workflow_stage_templates[1],
      template.workflow_stage_templates[0]
    ]
    store.commit('workview/PUSH_WORKFLOW_TEMPLATE', { ...template, workflow_stage_templates: unorderedTemplates })
    const wrapper = shallowMount(Stages, { localVue, mocks, store })
    const renderOrder = wrapper.findAll('.stage__template').wrappers
      .map(w => w.props('template'))
      .map((t: WorkflowStageTemplatePayload) => t.stage_number)
    expect(renderOrder).toEqual([1, 2, 3])
  })
})

it('renders correct selection indicator in item with a workflow', async () => {
  setupItemWithTemplate(store)
  setupActiveWorfklow(store)

  const [item] = store.state.workview.datasetItems
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])

  const wrapper = shallowMount(Stages, { localVue, mocks, store })
  await flushPromises()

  const { stages } = item.current_workflow!
  await wrapper.setData({
    instanceDimensions: [
      { id: stages[1][0].id, left: 0, width: 30 },
      { id: stages[2][0].id, left: 30, width: 30 },
      { id: stages[3][0].id, left: 60, width: 30 }
    ]
  })

  expect(
    wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
  ).toEqual('15px')

  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[3][0])
  await wrapper.vm.$nextTick()
  expect(
    wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
  ).toEqual('75px')

  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[2][0])
  await wrapper.vm.$nextTick()
  expect(
    wrapper.find<HTMLDivElement>('.stages__selection-indicator').element.style.left
  ).toEqual('45px')
})

it('renders correct current indicator', async () => {
  setupItemWithTemplate(store)
  setupActiveWorfklow(store)
  const [item] = store.state.workview.datasetItems

  const wrapper = shallowMount(Stages, { localVue, mocks, store })
  await flushPromises()

  const dimensionData = {
    stageDimensions: [
      { number: 1, left: 0, width: 30 },
      { number: 2, left: 30, width: 30 },
      { number: 3, left: 60, width: 30 }
    ],
    instanceDimensions: [
      { id: 1, left: 0, width: 30 },
      { id: 2, left: 0, width: 30 },
      { id: 3, left: 0, width: 30 }
    ]
  }

  await wrapper.setData(dimensionData)
  expect(
    wrapper.find<HTMLDivElement>('.stages__current-indicator').element.style.left
  ).toEqual('15px')

  const itemInStage3 = {
    ...item,
    current_workflow: { ...item.current_workflow!, current_stage_number: 3 }
  }
  store.commit('workview/SET_SELECTED_DATASET_ITEM', itemInStage3)

  await wrapper.setData(dimensionData)
  expect(
    wrapper.find<HTMLDivElement>('.stages__current-indicator').element.style.left
  ).toEqual('75px')

  const itemInStage2 = {
    ...item,
    current_workflow: { ...item.current_workflow!, current_stage_number: 2 }
  }
  store.commit('workview/SET_SELECTED_DATASET_ITEM', itemInStage2)

  await wrapper.setData(dimensionData)
  expect(
    wrapper.find<HTMLDivElement>('.stages__current-indicator').element.style.left
  ).toEqual('45px')
})
