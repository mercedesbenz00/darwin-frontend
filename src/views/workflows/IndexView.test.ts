import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import { TeamPayload } from '@/store/types'

import IndexView from './IndexView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let mocks: { $can: jest.Mock }
let team: TeamPayload

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(IndexView, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

const annotatorAbilities: Record<string, boolean> = {
  view_full_datasets: false
}

const memberAbilities: Record<string, boolean> = {
  view_full_datasets: true
}

beforeEach(() => {
  store = createTestStore()
  team = buildTeamPayload({})

  store.commit('team/SET_CURRENT_TEAM', team)
})

describe('when annotator', () => {
  beforeEach(() => {
    mocks = {
      $can: jest.fn().mockImplementation((ability: string) => annotatorAbilities[ability])
    }
  })

  itMatchesSnapshot()

  it('render view for annotator user role', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper.find('.annotators-workflow-overview').exists()).toBe(false)
  })
})

describe('when member or higher', () => {
  beforeEach(() => {
    mocks = {
      $can: jest.fn().mockImplementation((ability: string) => memberAbilities[ability])
    }
  })

  itMatchesSnapshot()

  it('render view for other user roles (> annotator)', () => {
    const wrapper = shallowMount(IndexView, { localVue, mocks, store })
    expect(wrapper.find('.annotators-workflow-overview').exists()).toBe(false)
  })
})
