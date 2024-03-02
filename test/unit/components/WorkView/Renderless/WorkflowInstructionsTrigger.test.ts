import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'
import { Mock } from 'test/unit/utils/storageMocks'

import WorkflowInstructionsTrigger from '@/components/WorkView/Renderless/WorkflowInstructionsTrigger'
import { viewedInstructionsOnDataset } from '@/utils/localStorageKeys'

const localVue = createLocalVue()
localVue.use(Vuex)

const mocks = { $ga: { event: jest.fn() } }

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  Object.defineProperty(window, 'localStorage', { value: new Mock() })
})

afterEach(() => {
  window.localStorage.clear()
})

describe('tutorial dataset', () => {
  beforeEach(() => {
    store.commit('workview/SET_TUTORIAL_MODE', true)
  })

  it('opens instructions on first load of dataset', async () => {
    const dataset = buildDatasetPayload({ id: 1 })

    store.commit('workview/SET_DATASET', dataset)
    const wrapper = shallowMount(WorkflowInstructionsTrigger, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(store.state.workview.instructionsIsOpen).toBe(true)
  })

  it('opens instructions on subsequent loads of dataset', async () => {
    const dataset = buildDatasetPayload({ id: 1 })
    window.localStorage.setItem(viewedInstructionsOnDataset(dataset), 'true')

    store.commit('workview/SET_DATASET', dataset)
    const wrapper = shallowMount(WorkflowInstructionsTrigger, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(store.state.workview.instructionsIsOpen).toBe(true)
  })
})

describe('non-tutorial dataset', () => {
  beforeEach(() => {
    store.commit('workview/SET_TUTORIAL_MODE', false)
  })

  it('opens instructions on first load of dataset', async () => {
    const dataset = buildDatasetPayload({ id: 1 })

    store.commit('workview/SET_DATASET', dataset)
    const wrapper = shallowMount(WorkflowInstructionsTrigger, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(store.state.workview.instructionsIsOpen).toBe(true)
  })

  it('sets local storage item if instructions were opened', async () => {
    const dataset = buildDatasetPayload({ id: 1 })
    store.commit('workview/SET_DATASET', dataset)

    const key = viewedInstructionsOnDataset(dataset)
    expect(window.localStorage.getItem(key)).toBeFalsy()

    const wrapper = shallowMount(WorkflowInstructionsTrigger, { localVue, mocks, store })
    await wrapper.vm.$nextTick()

    expect(window.localStorage.getItem(key)).toBeTruthy()
  })

  it('does not open instructions on subsequent loads of dataset', async () => {
    const dataset = buildDatasetPayload({ id: 1 })
    window.localStorage.setItem(viewedInstructionsOnDataset(dataset), 'true')

    store.commit('workview/SET_DATASET', dataset)
    const wrapper = shallowMount(WorkflowInstructionsTrigger, { localVue, mocks, store })
    await wrapper.vm.$nextTick()
    expect(store.state.workview.instructionsIsOpen).toBe(false)
  })
})
