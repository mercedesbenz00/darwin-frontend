import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildTeamPayload, buildV2WorkflowPayload } from 'test/unit/factories'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import SearchField from '@/components/Common/SearchField/V2/SearchField.vue'
import AnnotatorsWorkflowCard from '@/components/Workflow/AnnotatorsWorkflowCard.vue'
import AnnotatorsWorkflowTitle from '@/components/Workflow/AnnotatorsWorkflowTitle.vue'
import SortControl from '@/components/WorkflowFiltering/SortControl.vue'
import { TeamPayload } from '@/store/types'

import IndexAnnotators from './IndexAnnotators.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const mocks = {
  $route: {
    name: String,
    params: {},
    query: {}
  },
  $router: { push: Function },
  $theme: createMockTheme()
}
let store: ReturnType<typeof createTestStore>
let team: TeamPayload

beforeEach(() => {
  store = createTestStore()
  team = buildTeamPayload({})

  store.commit('team/SET_CURRENT_TEAM', team)
})

it('loads workflows when mounted', async () => {
  shallowMount(IndexAnnotators, { localVue, mocks, store })

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('v2Workflow/loadWorkflows', { worker: true })
})

it('loads workflows on team change', async () => {
  const anotherTeam = buildTeamPayload({ id: 2 })
  shallowMount(IndexAnnotators, { localVue, mocks, store })
  await flushPromises()

  store.commit('team/SET_CURRENT_TEAM', anotherTeam)
  await flushPromises()

  expect(store.dispatch)
    .toHaveBeenCalledWith('v2Workflow/loadWorkflows', { worker: true })
})

it('loads filters from URL when present', async () => {
  const newMocks = {
    ...mocks,
    $route: {
      ...mocks.$route,
      query: {
        search: 'foo',
        sortBy: 'name',
        sortDirection: 'desc'
      }
    }
  }

  const wrapper = shallowMount(IndexAnnotators, { localVue, mocks: newMocks, store })
  const { search, sortBy, sortDirection } = wrapper.vm.$data

  await flushPromises()

  expect(search).toBe('foo')
  expect(sortBy).toBe('name')
  expect(sortDirection).toBe('desc')
})

describe('when is loading workflows', () => {
  it('matches snapshot', async () => {
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ workflowsLoading: true })

    expect(wrapper).toMatchSnapshot()
  })

  it('renders the spinner', async () => {
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ workflowsLoading: true })

    expect(wrapper.findComponent(CircleSpinner).exists()).toBe(true)
  })

  it('does not render any workflow card', async () => {
    const workflow = buildV2WorkflowPayload({})
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ workflowsLoading: true })

    expect(wrapper.findComponent(AnnotatorsWorkflowCard).exists()).toBe(false)
  })
})

describe('when there are no workflows assigned to the user', () => {
  beforeEach(() => {
    store.commit('v2Workflow/SET_WORKFLOWS', [])
  })

  it('matches snapshot', async () => {
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    expect(wrapper).toMatchSnapshot()
  })

  it('does not render any workflow card', async () => {
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    expect(wrapper.findAllComponents(AnnotatorsWorkflowCard).length).toBe(0)
  })

  it('renders a no workflows message', async () => {
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    expect(wrapper.text()).toBe('There are no workflows assigned to you')
  })
})

describe('when there are workflows assigned to the user', () => {
  it('matches snapshot', async () => {
    const workflow = buildV2WorkflowPayload({})
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    expect(wrapper).toMatchSnapshot()
  })

  it('renders a workflow card for each workflow', async () => {
    const count = Math.round(Math.random() * (3 - 1) + 1) // random in 1..3
    const workflows = new Array(count)
      .fill(null)
      .map((_, i) => buildV2WorkflowPayload({ id: `${i}` }))
    store.commit('v2Workflow/SET_WORKFLOWS', workflows)
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    expect(wrapper.findAllComponents(AnnotatorsWorkflowCard).length).toBe(count)
  })

  it('passes the workflow to the workflow card as :workflow', async () => {
    const workflow = buildV2WorkflowPayload({})
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()

    const workflowCard = wrapper.findComponent(AnnotatorsWorkflowCard)
    expect(workflowCard.props().workflow).toBe(workflow)
  })
})

describe('when there are workflows assigned and user search has matches', () => {
  it('matches snapshot', async () => {
    const workflows = [
      buildV2WorkflowPayload({ id: '1', name: 'foo' }),
      buildV2WorkflowPayload({ id: '2', name: 'bar' })
    ]
    store.commit('v2Workflow/SET_WORKFLOWS', workflows)
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ search: 'foo' })

    expect(wrapper).toMatchSnapshot()
  })

  it('renders a workflow card for each match', async () => {
    const count = Math.round(Math.random() * (3 - 1) + 1) // random in 1..3
    const workflows = new Array(count)
      .fill(null)
      .map((_, i) => buildV2WorkflowPayload({ id: `${i}`, name: 'foo' }))
      .concat([buildV2WorkflowPayload({ id: '5', name: 'bar' })])
    store.commit('v2Workflow/SET_WORKFLOWS', workflows)
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ search: 'foo' })

    expect(wrapper.findAllComponents(AnnotatorsWorkflowCard).length).toBe(count)
  })
})

describe('when there are workflows assigned and user search has no matches', () => {
  it('matches snapshot', async () => {
    const workflow = buildV2WorkflowPayload({ name: 'foo' })
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ search: 'bar' })

    expect(wrapper).toMatchSnapshot()
  })

  it('renders a no matches message', async () => {
    const workflow = buildV2WorkflowPayload({ name: 'foo' })
    store.commit('v2Workflow/SET_WORKFLOWS', [workflow])
    const wrapper = shallowMount(IndexAnnotators, { localVue, mocks, store })

    await flushPromises()
    await wrapper.setData({ search: 'bar' })

    expect(wrapper.text()).toBe('There are no workflows assigned to you with keyword "bar"')
  })
})

describe('<annotators-workflow-title />', () => {
  it('is rendered with workflowsLoading as :loading', async () => {
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })
    const title = wrapper.findComponent(AnnotatorsWorkflowTitle)

    await flushPromises()
    await wrapper.setData({ workflowsLoading: false })
    expect(title.props().loading).toBe(false)

    await wrapper.setData({ workflowsLoading: true })
    expect(title.props().loading).toBe(true)
  })

  it('is rendered with the number of assigned workflows as :count', () => {
    const count = Math.round(Math.random() * (3 - 1) + 1) // random in 1..3
    const workflows = new Array(count)
      .fill(null)
      .map((_, i) => buildV2WorkflowPayload({ id: `${i}` }))
    store.commit('v2Workflow/SET_WORKFLOWS', workflows)
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })
    const title = wrapper.findComponent(AnnotatorsWorkflowTitle)

    expect(title.props().count).toBe(count)
  })
})

describe('<search-field />', () => {
  it('is rendered disabled if loading workflows', async () => {
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })
    const title = wrapper.findComponent(SearchField)

    await flushPromises()
    await wrapper.setData({ workflowsLoading: false })
    expect(title.props().disabled).toBe(false)

    await wrapper.setData({ workflowsLoading: true })
    expect(title.props().disabled).toBe(true)
  })
})

describe('<sort-control />', () => {
  it('is rendered disabled if loading workflows', async () => {
    const wrapper = mount(IndexAnnotators, { localVue, mocks, store })
    const control = wrapper.findComponent(SortControl)

    await flushPromises()
    await wrapper.setData({ workflowsLoading: false })
    expect(control.props().disabled).toBe(false)

    await wrapper.setData({ workflowsLoading: true })
    expect(control.props().disabled).toBe(true)
  })
})
