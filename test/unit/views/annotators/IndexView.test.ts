import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import IndexView from '@/views/annotators/IndexView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $can: (ability?: string) => boolean
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ name: 'Test Team' }))
  mocks = { $can: () => true }
})

describe('with loaded datasets', () => {
  beforeEach(() => {
    store.commit('dataset/SET_DATASETS', [
      buildDatasetPayload({ id: 1, name: 'Smart Fumehood' }),
      buildDatasetPayload({ id: 2, name: 'Birds' })
    ])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders datasets', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper.findAll('annotation-metrics-stub').length).toEqual(2)
  })
})

it('fetches datasets on mount', () => {
  shallowMount(IndexView, { localVue, mocks, store })
  expect(store.dispatch).toHaveBeenCalledWith('dataset/getDatasets')
})

describe('when team member', () => {
  beforeEach(() => {
    mocks = { $can: () => true }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders "Request Annotators" link', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper.text()).toContain('Request annotators')
  })
})

describe('when annotator', () => {
  beforeEach(() => {
    mocks = { $can: () => false }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render "Request Annotators" link', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper.text()).not.toContain('Request annotators')
  })
})
