import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Router from 'vue-router'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import {
  buildDatasetDetailPayload,
  buildDatasetPayload,
  buildV2DatasetItemPayload,
  buildV2DARCWorkflow
} from 'test/unit/factories'

import V2WorkflowSidebar from '@/components/DatasetManagement/Sidebar/V2WorkflowSidebar.vue'
import { installCommonComponents } from '@/plugins/components'
import {
  DatasetItemStatus,
  DatasetPayload,
  StageType,
  V2DatasetItemPayload,
  V2DatasetStagePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)
let router: Router
installCommonComponents(localVue)

let propsData: { dataset: DatasetPayload, datasetItems?: V2DatasetItemPayload[] }
let store: ReturnType<typeof initializeStore>
const myDatasetDetails = buildDatasetDetailPayload({ id: 1 })
const items = [
  buildV2DatasetItemPayload({ id: '1', status: DatasetItemStatus.processing }),
  buildV2DatasetItemPayload({ id: '2', status: DatasetItemStatus.uploading }),
  buildV2DatasetItemPayload({ id: '3', status: DatasetItemStatus.complete }),
  buildV2DatasetItemPayload({ id: '4', status: DatasetItemStatus.archived })
]

beforeEach(() => {
  store = initializeStore()
  router = new Router()
  const { dispatch } = store
  store.commit('dataset/PUSH_DATASET_DETAILS', myDatasetDetails)

  store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
    if (action.startsWith('toast') || action === 'team/getMemberships') {
      return {}
    } else {
      return dispatch(action, payload)
    }
  })

  propsData = {
    dataset: buildDatasetPayload({ work_prioritization: 'priority:desc' })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dataset item filter is set', async () => {
  jest.spyOn(router, 'replace')
  const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

describe('navigates with new query params', () => {
  beforeEach(() => {
    jest.spyOn(router, 'replace')
  })
  
  it('triggers navigation when positive status filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    wrapper.find('status-filter-stub')
    await wrapper.find('status-filter-stub').vm.$emit('change', { 
      positiveOptions: [DatasetItemStatus.annotate] 
    })
    expect(router.replace).toBeCalledWith({
      query: { statuses: [DatasetItemStatus.annotate] }
    })
  })

  it('triggers navigation when negative status filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('status-filter-stub').vm.$emit('change', { 
      negativeOptions: [DatasetItemStatus.annotate] 
    })
    expect(router.replace).toBeCalledWith({
      query: { not_statuses: [DatasetItemStatus.annotate] }
    })
  })

  it('triggers navigation when positive class filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('class-filter-stub').vm.$emit('change', { positiveOptions: [2] })
    expect(router.replace).toBeCalledWith({
      query: { annotation_class_ids: ['2'] }
    })
  })

  it('triggers navigation when negative class filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('class-filter-stub').vm.$emit('change', { negativeOptions: [2] })
    expect(router.replace).toBeCalledWith({
      query: { not_annotation_class_ids: ['2'] }
    })
  })

  it('disable class fitler action button when no items selected', () => {
    store.commit('dataset/SET_SELECTED_ITEMS', [])
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper.find('class-filter-stub').attributes('disabled')).toBe('true')
  })

  it('disable class fitler action button when in process items are selected', () => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['1'])
    propsData.datasetItems = items
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper.find('class-filter-stub').attributes('disabled')).toBe('true')
  })

  it('disable class filter when selected all and processing status count is not 0', () => {
    store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
    myDatasetDetails.status_counts.push({ count: 1, status: DatasetItemStatus.processing })
    store.commit('dataset/PUSH_DATASET_DETAILS', myDatasetDetails)
    propsData.datasetItems = items
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper.find('class-filter-stub').attributes('disabled')).toBe('true')
  })

  it('use correct class filter action disabled tooltip when in process items are selected', () => {
    store.commit('dataset/SET_SELECTED_ITEMS', ['1'])
    propsData.datasetItems = items
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper.find('class-filter-stub')
      .attributes('disabledactiontooltip')).toBe("Can't tag uploading/processing items")
  })

  it('triggers navigation when positive annotator filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { positiveAssignees: [2, 3] })
    expect(router.replace).toBeCalledWith({
      query: { assignees: ['2', '3'] }
    })
  })

  it('triggers navigation when negative annotator filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { negativeAssignees: [2, 3] })
    expect(router.replace).toBeCalledWith({
      query: { not_assignees: ['2', '3'] }
    })
  })

  it('triggers navigation when positive filenames filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { positiveFilenames: ['1.jpg'] })
    expect(router.replace).toBeCalledWith({
      query: { item_names: ['1.jpg'] }
    })
  })

  it('triggers navigation when negative filenames filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { negativeFilenames: ['1.jpg'] })
    expect(router.replace).toBeCalledWith({
      query: { not_item_names: ['1.jpg'] }
    })
  })

  it('triggers navigation when positive paths filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { positivePaths: ['/root']})
    expect(router.replace).toBeCalledWith({
      query: { item_paths: ['/root'] }
    })
  })

  it('triggers navigation when negative paths filter updated', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    await wrapper.find('generic-filter-stub').vm.$emit('change', { negativePaths: ['/root']})
    expect(router.replace).toBeCalledWith({
      query: { not_item_paths: ['/root'] }
    })
  })
})

describe('in workflows 2.0', () => {
  beforeEach(() => {
    const workflow = buildV2DARCWorkflow()
    const stage = workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
    stage.config.dataset_id = propsData.dataset.id
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    jest.spyOn(router, 'replace')
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders v2 stage filter', () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })
    expect(wrapper.find('stage-filter-stub').exists()).toBe(true)
  })

  it('responds to changes', async () => {
    const wrapper = shallowMount(V2WorkflowSidebar, { localVue, propsData, router, store })

    await wrapper.find('stage-filter-stub').vm.$emit('change', {
      includedIds: ['annotate'],
      excludedIds: ['review']
    })

    expect(router.replace).toBeCalledWith({
      query: { 
        workflow_stage_ids: ['annotate'],
        not_workflow_stage_ids: ['review'] 
      }
    })
  })
})
