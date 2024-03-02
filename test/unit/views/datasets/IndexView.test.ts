import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import IndexView from '@/views/datasets/IndexView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $can: jest.Mock
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
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
})

describe('when annotator', () => {
  beforeEach(() => {
    mocks = {
      $can: jest.fn().mockImplementation((ability: string) => annotatorAbilities[ability])
    }
  })

  itMatchesSnapshot()
})

describe('when member or higher', () => {
  beforeEach(() => {
    mocks = {
      $can: jest.fn().mockImplementation((ability: string) => memberAbilities[ability])
    }
  })

  itMatchesSnapshot()
})
