import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { VPopover } from 'test/unit/stubs'

import WorkflowWarning from '@/components/WorkView/TopBar/components/WorkflowWarning.vue'
import workviewTracker, { getInitialState as trackerState } from '@/store/modules/workviewTracker'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      workviewTracker: { ...workviewTracker, state: trackerState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  return store
}

let mocks: {
  $sentry: { captureEvent: Function, Severity: { Error: string } }
}

let store: ReturnType<typeof newStore>
let propsData: { topic: string }
const stubs = { VPopover }

beforeEach(() => {
  store = newStore()
  const $sentry = { captureEvent: jest.fn(), Severity: { Error: 'error' } }
  mocks = { $sentry }
  propsData = { topic: 'workview:annotation:stage:1' }
})

it('matches snapshot when error joining', () => {
  store.commit('workviewTracker/SET_STATUS', 'error')
  const wrapper = shallowMount(WorkflowWarning, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('reports to sentry if channel enters error state', async () => {
  const wrapper = shallowMount(WorkflowWarning, { localVue, propsData, mocks, store, stubs })
  store.commit('workviewTracker/SET_STATUS', 'error')
  await wrapper.vm.$nextTick()

  expect(mocks.$sentry.captureEvent).toHaveBeenCalledTimes(1)
})

it('dispatches toast if channel enters error state', async () => {
  const wrapper = shallowMount(WorkflowWarning, { localVue, propsData, mocks, store, stubs })
  store.commit('workviewTracker/SET_STATUS', 'error')
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: expect.any(String) })
})
