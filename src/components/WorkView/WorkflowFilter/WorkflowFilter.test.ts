import { mount, createLocalVue, Wrapper, Stubs } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import { Route } from 'vue-router'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildMembershipPayload,
  buildTeamPayload,
  buildV2DARCWorkflow
} from 'test/unit/factories'
import { initializeARTemplate } from 'test/unit/factories/helpers'

import {
  MembershipPayload,
  DatasetItemStatus,
  V2DatasetStagePayload,
  StageType
} from '@/store/types'

import WorkflowFilter from './WorkflowFilter.vue'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })
localVue.use(Vuex)
localVue.directive('click-outside', () => {})

let store: ReturnType<typeof createTestStore>
let wrapper: Wrapper<Vue>
let members: MembershipPayload[]
let mocks: {
  $can: () => boolean,
  $theme: ReturnType<typeof createMockTheme>,
  $route: {
    name: string,
    params: Object,
    query: Object
  },
  $router: { push: Function }
}
const stubs: Stubs = {
  'router-link': true
}

const currentTeam = buildTeamPayload({ id: 1 })

const setupMembers = (): MembershipPayload[] => [
  buildMembershipPayload({
    id: 1,
    team_id: 1,
    user_id: 11,
    first_name: 'Sam',
    last_name: 'Annotator'
  }),
  buildMembershipPayload({
    id: 2,
    team_id: 1,
    user_id: 22,
    first_name: 'Jim',
    last_name: 'Annotator'
  }),
  buildMembershipPayload({
    id: 3,
    team_id: 1,
    user_id: 33,
    first_name: 'Joe',
    last_name: 'Member'
  }),
  buildMembershipPayload({
    id: 4,
    team_id: 2,
    user_id: 33,
    first_name: 'Jake',
    last_name: 'OtherTeam'
  })
]

const sfh = buildDatasetPayload({
  id: 99,
  name: 'sfh',
  default_workflow_template_id: 55,
  work_prioritization: 'priority:desc'
})
const template = initializeARTemplate(sfh)
template.id = 55

beforeEach(() => {
  store = createTestStore()
  members = setupMembers()
  store.commit('team/SET_MEMBERSHIPS', members)
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/PUSH_WORKFLOW_TEMPLATE', template)
  mocks = {
    $can: (): boolean => true,
    $theme: createMockTheme(),
    $route: { name: 'Workflow', params: {}, query: {} },
    $router: { push: jest.fn() }
  }

  wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
})

describe('when popup menu is closed', () => {
  it('matches snapshot', () => {
    wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
    expect(wrapper.find('.popup-menu').exists()).toBe(false)
    expect(wrapper).toMatchSnapshot('expanded')
  })
})

describe('when popup menu is open', () => {
  it('matches snapshot', async () => {
    wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
    const button = wrapper.find('.workflow-filter__button')
    await button.vm.$emit('click')
    await new Promise((resolve) => setTimeout(resolve, 200))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.popup-menu').exists()).toBe(true)
    expect(wrapper).toMatchSnapshot('expanded')
  })
})

const routerPushed = (query: Route['query']): void =>
  expect(mocks.$router.push).toBeCalledWith({
    query
  })

describe('when annotator', () => {
  beforeEach(async () => {
    mocks.$can = (): boolean => false

    wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
    wrapper.setData({ open: true })
    await wrapper.vm.$nextTick()
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('trigger navigation when sort option updated', async () => {
    const sortControl = wrapper.find('.workflow-filter__sort')
    await sortControl.vm.$emit('change', { sortBy: 'inserted_at', sortDirection: 'asc' })
    routerPushed({ sort: 'inserted_at:asc' })
  })

  it('trigger navigation when positive class filter updated', async () => {
    const classFilter = wrapper.find('.workflow-filter__classes')
    await classFilter.vm.$emit('update:positive-class-ids', [2])
    await classFilter.vm.$emit('change')
    routerPushed({ annotation_class_ids: ['2'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative class filter updated', async () => {
    const classFilter = wrapper.find('.workflow-filter__classes')
    await classFilter.vm.$emit('update:negative-class-ids', [2])
    await classFilter.vm.$emit('change')
    routerPushed({ not_annotation_class_ids: ['2'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive status filter updated', async () => {
    const statusFilter = wrapper.find('.workflow-filter__status')
    await statusFilter.vm.$emit('update:positive-statuses', [DatasetItemStatus.annotate])
    await statusFilter.vm.$emit('change')
    routerPushed({ statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when negative status filter updated', async () => {
    const statusFilter = wrapper.find('.workflow-filter__status')
    await statusFilter.vm.$emit('update:negative-statuses', [DatasetItemStatus.annotate])
    await statusFilter.vm.$emit('change')
    routerPushed({ not_statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when status filter updated', async () => {
    const statusFilter = wrapper.find('.workflow-filter__status')
    await statusFilter.vm.$emit('update:commented', true)
    await statusFilter.vm.$emit('change')
    routerPushed({ has_comments: 'true', sort: 'priority:desc' })
  })
})

describe('when workforce manager', () => {
  beforeEach(async () => {
    mocks.$can = (): boolean => true
    wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
    await wrapper.setData({ open: true })
    await wrapper.vm.$nextTick()
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('trigger navigation when sort option updated', async () => {
    const sortControl = wrapper.find('.workflow-filter__sort')
    await sortControl.vm.$emit('change', { sortBy: 'inserted_at', sortDirection: 'asc' })
    routerPushed({ sort: 'inserted_at:asc' })
  })

  it('trigger navigation when positive annotator filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:positive-assignees', [2, 3])
    await genericFilter.vm.$emit('change')
    routerPushed({ current_assignees: ['2', '3'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative annotator filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:negative-assignees', [2, 3])
    await genericFilter.vm.$emit('change')
    routerPushed({ not_current_assignees: ['2', '3'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive filenames filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:positive-filenames', ['1.jpg'])
    await genericFilter.vm.$emit('change')
    routerPushed({ filenames: ['1.jpg'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative filenames filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:negative-filenames', ['1.jpg'])
    await genericFilter.vm.$emit('change')
    routerPushed({ not_filenames: ['1.jpg'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive paths filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:positive-paths', ['/root'])
    await genericFilter.vm.$emit('change')
    routerPushed({ paths: ['/root'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative paths filter updated', async () => {
    const genericFilter = wrapper.find('.workflow-filter__generic')
    genericFilter.vm.$emit('update:negative-paths', ['/root'])
    await genericFilter.vm.$emit('change')
    routerPushed({ not_paths: ['/root'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive stage template filter updated', async () => {
    const stageTemplateFilter = wrapper.find('.workflow-filter__stage-template')
    stageTemplateFilter.vm.$emit('update:positive-stage-template-ids', [1])
    await stageTemplateFilter.vm.$emit('change')
    routerPushed({ workflow_stage_template_ids: ['1'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative stage template filter updated', async () => {
    const stageTemplateFilter = wrapper.find('.workflow-filter__stage-template')
    stageTemplateFilter.vm.$emit('update:negative-stage-template-ids', [1])
    await stageTemplateFilter.vm.$emit('change')
    routerPushed({ not_workflow_stage_template_ids: ['1'], sort: 'priority:desc' })
  })

  it('trigger navigation when positive status filter updated', async () => {
    const statusFilter = wrapper.find('.workflow-filter__status')
    statusFilter.vm.$emit('update:positive-statuses', [DatasetItemStatus.annotate])
    await statusFilter.vm.$emit('change')
    routerPushed({ statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when negative status filter updated', async () => {
    const statusFilter = wrapper.find('.workflow-filter__status')
    statusFilter.vm.$emit('update:negative-statuses', [DatasetItemStatus.annotate])
    await statusFilter.vm.$emit('change')
    routerPushed({ not_statuses: [DatasetItemStatus.annotate], sort: 'priority:desc' })
  })

  it('trigger navigation when positive class filter updated', async () => {
    const classFilter = wrapper.find('.workflow-filter__classes')
    classFilter.vm.$emit('update:positive-class-ids', [2])
    await classFilter.vm.$emit('change')
    routerPushed({ annotation_class_ids: ['2'], sort: 'priority:desc' })
  })

  it('trigger navigation when negative class filter updated', async () => {
    const classFilter = wrapper.find('.workflow-filter__classes')
    classFilter.vm.$emit('update:negative-class-ids', [2])
    await classFilter.vm.$emit('change')
    routerPushed({ not_annotation_class_ids: ['2'], sort: 'priority:desc' })
  })
})

describe('in workflows 2.0', () => {
  beforeEach(async () => {
    mocks.$can = (): boolean => true
    const workflow = buildV2DARCWorkflow()
    const stage = workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
    stage.config.dataset_id = sfh.id
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    wrapper = mount(WorkflowFilter, { localVue, mocks, store, stubs })
    await wrapper.setData({ open: true })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('renders v2 stage filter', () => {
    const stageFilter = wrapper.find('.workflow-filter__stage')
    expect(stageFilter.exists()).toBe(true)
  })

  it('responds to changes', async () => {
    const stageTemplateFilter = wrapper.find('.workflow-filter__stage')
    await stageTemplateFilter.vm.$emit('change', {
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
