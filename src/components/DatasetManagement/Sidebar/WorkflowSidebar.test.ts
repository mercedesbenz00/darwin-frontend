import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { Route } from 'vue-router'
import Vuex from 'vuex'

import { initializeStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildV2DARCWorkflow } from 'test/unit/factories'

import WorkflowSidebar from '@/components/DatasetManagement/Sidebar/WorkflowSidebar.vue'
import { installCommonComponents } from '@/plugins/components'
import { DatasetItemStatus, DatasetPayload, StageType, V2DatasetStagePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let mocks: {
  $route: {
    name?: string,
    params?: Record<string, string | string[]>,
    query: Record<string, string | string[] | boolean>
  }
  $router: {
    push: jest.SpyInstance
  }
}
let propsData: { dataset: DatasetPayload }
let store: ReturnType<typeof initializeStore>

beforeEach(() => {
  store = initializeStore()
  const { dispatch } = store

  store.dispatch = jest.fn().mockImplementation((action: string, payload: unknown) => {
    if (action.startsWith('toast') || action === 'team/getMemberships') {
      return {}
    } else {
      return dispatch(action, payload)
    }
  })

  mocks = {
    $route: { name: 'DatasetManagementData', params: {}, query: {} },
    $router: { push: jest.fn() }
  }

  propsData = {
    dataset: buildDatasetPayload({ work_prioritization: 'priority:desc' })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when dataset item filter is set', async () => {
  mocks.$route.query = {
    annotation_class_ids: ['1', '2'],
    not_annotation_class_ids: ['3', '4'],
    current_assignees: ['2', '3'],
    not_current_assignees: ['4', '5'],
    filenames: ['1.jpg'],
    not_filenames: ['2.jpg'],
    has_comments: 'true',
    paths: ['/root'],
    not_paths: ['/temp'],
    sort: 'inserted_at:asc',
    statuses: ['new'],
    not_statuses: ['annotate'],
    workflow_stage_template_ids: ['2'],
    not_workflow_stage_template_ids: ['3']
  }
  const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

const routerPushed = (query: Route['query']): void =>
  expect(mocks.$router.push).toBeCalledWith({
    query
  })

describe('navigates with new query params', () => {
  beforeEach(() => {
    mocks.$route.query = {
      annotation_class_ids: [],
      not_annotation_class_ids: [],
      current_assignees: [],
      not_current_assignees: [],
      filenames: [],
      not_filenames: [],
      has_comments: false,
      paths: [],
      not_paths: [],
      sort: 'inserted_at:asc',
      statuses: [],
      not_statuses: [],
      workflow_stage_template_ids: [],
      not_workflow_stage_template_ids: []
    }
  })

  it('trigger navigation when sort option updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    await wrapper.find('sort-control-stub').vm.$emit('change', {
      sortBy: 'inserted_at', sortDirection: 'asc'
    })
    routerPushed({ sort: 'inserted_at:asc' })
  })

  it('trigger navigation when positive annotator filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:positive-assignees', [2, 3])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ current_assignees: ['2', '3'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative annotator filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:negative-assignees', [2, 3])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ not_current_assignees: ['2', '3'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive filenames filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:positive-filenames', ['1.jpg'])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ filenames: ['1.jpg'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative filenames filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:negative-filenames', ['1.jpg'])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ not_filenames: ['1.jpg'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive paths filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:positive-paths', ['/root'])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ paths: ['/root'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative paths filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('generic-filter-stub').vm.$emit('update:negative-paths', ['/root'])
    await wrapper.find('generic-filter-stub').vm.$emit('change')
    routerPushed({ not_paths: ['/root'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive stage template filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('stage-template-filter-stub').vm.$emit('update:positive-stage-template-ids', [1])
    await wrapper.find('stage-template-filter-stub').vm.$emit('change')
    routerPushed({ workflow_stage_template_ids: ['1'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative stage template filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('stage-template-filter-stub').vm.$emit('update:negative-stage-template-ids', [1])
    await wrapper.find('stage-template-filter-stub').vm.$emit('change')
    routerPushed({ not_workflow_stage_template_ids: ['1'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive status filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('status-filter-stub')
      .vm.$emit('update:positive-statuses', [DatasetItemStatus.annotate])
    await wrapper.find('status-filter-stub').vm.$emit('change')
    routerPushed({ statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when negative status filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('status-filter-stub')
      .vm.$emit('update:negative-statuses', [DatasetItemStatus.annotate])
    await wrapper.find('status-filter-stub').vm.$emit('change')
    routerPushed({ not_statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when commented filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('status-filter-stub').vm.$emit('update:commented', true)
    await wrapper.find('status-filter-stub').vm.$emit('change')
    routerPushed({ has_comments: 'true', sort: 'priority:desc' })
  })

  it('trigger navigation when class filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('class-filter-stub').vm.$emit('update:positive-class-ids', [2])
    await wrapper.find('class-filter-stub').vm.$emit('change')
    routerPushed({ annotation_class_ids: ['2'], sort: 'priority:desc' })
  })

  it('trigger navigation when class filter updated', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    wrapper.find('class-filter-stub').vm.$emit('update:negative-class-ids', [2])
    await wrapper.find('class-filter-stub').vm.$emit('change')
    routerPushed({ not_annotation_class_ids: ['2'], sort: 'priority:desc' })
  })
})

describe('in workflows 2.0', () => {
  beforeEach(() => {
    const workflow = buildV2DARCWorkflow()
    const stage = workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
    stage.config.dataset_id = propsData.dataset.id
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders v2 stage filter', () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })
    expect(wrapper.find('stage-filter-stub').exists()).toBe(true)
  })

  it('responds to changes', async () => {
    const wrapper = shallowMount(WorkflowSidebar, { localVue, mocks, propsData, store })

    await wrapper.find('stage-filter-stub').vm.$emit('change', {
      includedIds: ['annotate'],
      excludedIds: ['review']
    })

    routerPushed({
      current_workflow_stage_ids: ['annotate'],
      not_current_workflow_stage_ids: ['review'],
      sort: 'priority:desc'
    })
  })
})
