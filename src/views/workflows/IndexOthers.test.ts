import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload, buildV2WorkflowPayload } from 'test/unit/factories'

import { TeamPayload } from '@/store/types'

import IndexOthers from './IndexOthers.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const mocks = {
  $theme: createMockTheme(),
  $route: {
    name: String,
    params: {},
    query: {}
  },
  $router: { push: Function }
}
let team: TeamPayload

const itMatchesSnapshot = (): void => it('matches snapshot', async () => {
  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
  await wrapper.setData({ workflowsLoading: false, search: '' })
  expect(wrapper).toMatchSnapshot()
})

beforeEach(() => {
  store = createTestStore()
  team = buildTeamPayload({})

  store.commit('team/SET_CURRENT_TEAM', team)
})

it('is instantiated', () => {
  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
  expect(wrapper).toBeTruthy()
})

describe('when there is no workflow', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    store.commit('v2Workflow/SET_WORKFLOWS', [])
  })

  it('should render an empty warning message', async () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    await wrapper.setData({ workflowsLoading: false, search: '' })
    expect(wrapper.find('.workflow-section__card').exists()).toBe(false)
    const noContent = wrapper.find('.workflow-overview__section__no-content')
    expect(noContent.exists()).toBe(true)
    expect(noContent.text()).toBe('There are no workflows')
  })
})

describe('when there is 1 workflow BUT a search filter it out', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    const workflow = buildV2WorkflowPayload({})
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  })

  it('should render an empty warning message', async () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    const search = 'name-that-does-not-exists'
    await wrapper.setData({ workflowsLoading: false, search })
    expect(wrapper.find('.workflow-section__card').exists()).toBe(false)
    const noContent = wrapper.find('.workflow-overview__section__no-content')
    expect(noContent.exists()).toBe(true)
    expect(noContent.text()).toBe(`There are no workflows with keyword "${search}"`)
    expect(noContent.find('workflow-create-card-stub').exists()).toBe(true)
  })
})

describe('when there is 1 workflow', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    const workflow = buildV2WorkflowPayload({})
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
  })

  it('should render', async () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    await wrapper.setData({ workflowsLoading: false })
    expect(wrapper.find('.workflow-overview__section__content__card').exists()).toBe(true)
    expect(wrapper.findAll('.workflow-overview__section__content__card').length).toBe(1)
  })
})

describe('when there are multiple workflows', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    const workflowA = buildV2WorkflowPayload({ id: 'foo' })
    const workflowB = buildV2WorkflowPayload({ id: 'bar' })
    const workflowC = buildV2WorkflowPayload({ id: 'baz' })
    store.commit('v2Workflow/SET_WORKFLOWS', [workflowA, workflowB, workflowC])
  })

  it('they should render', async () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    await wrapper.setData({ workflowsLoading: false })
    expect(wrapper.find('.workflow-overview__section__content__card').exists()).toBe(true)
    expect(wrapper.findAll('.workflow-overview__section__content__card').length).toBe(3)
  })
})

describe('when no url args exist', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    mocks.$route.query = {}
  })

  it('default filters are used', async () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    const { search, sortBy, sortDirection } = wrapper.vm.$data
    await wrapper.setData({ workflowsLoading: false })
    expect(search).toBe('')
    expect(sortBy).toBe('updated_at')
    expect(sortDirection).toBe('asc')
  })
})

describe('when url args exist', () => {
  itMatchesSnapshot()

  beforeEach(() => {
    mocks.$route.query = {
      search: 'foo',
      sortBy: 'name',
      sortDirection: 'desc'
    }
  })

  it('default filters are used', () => {
    const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })
    const { search, sortBy, sortDirection } = wrapper.vm.$data
    expect(search).toBe('foo')
    expect(sortBy).toBe('name')
    expect(sortDirection).toBe('desc')
  })
})

it('loads workflows when mounted', () => {
  shallowMount(IndexOthers, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledWith('v2Workflow/loadWorkflows')
})

it('loads workflows on team change', async () => {
  shallowMount(IndexOthers, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledTimes(1)
  await flushPromises()

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 2 }))
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(2)

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 3 }))
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(3)
})
