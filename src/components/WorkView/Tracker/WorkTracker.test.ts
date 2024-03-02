import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { VPopover } from 'test/unit/stubs'

import WorkTracker from '@/components/WorkView/Tracker/WorkTracker.vue'
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

it('matches snapshot when time is 0', () => {
  store.commit('workviewTracker/STOP_TIMER')
  store.commit('workviewTracker/SET_TIME', 0)
  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when timer stopped', () => {
  store.commit('workviewTracker/STOP_TIMER')
  store.commit('workviewTracker/SET_TIME', 10)
  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when timer started', () => {
  store.commit('workviewTracker/START_TIMER')
  store.commit('workviewTracker/SET_TIME', 10)
  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when timer paused', () => {
  store.commit('workviewTracker/START_TIMER')
  store.commit('workviewTracker/PAUSE_TIMER')
  store.commit('workviewTracker/SET_TIME', 10)
  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('automatically joins channel on specified topic', () => {
  store.commit('workviewTracker/PAUSE_TIMER')
  shallowMount(WorkTracker, { localVue, propsData, mocks, store, stubs })

  expect(store.dispatch)
    .toHaveBeenCalledWith('workviewTracker/joinChannel', { topic: 'workview:annotation:stage:1' })
})

it('leaves channel on destroy', () => {
  store.commit('workviewTracker/SET_TIME', 10)
  store.commit('workviewTracker/PAUSE_TIMER')

  shallowMount(WorkTracker, { localVue, propsData, store, stubs }).destroy()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/leaveChannel')
})

it('toggles timer in store on tracker click', async () => {
  store.commit('workviewTracker/SET_TIME', 10)
  store.commit('workviewTracker/PAUSE_TIMER')

  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })
  wrapper.find('work-timer-stub').vm.$emit('click')
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/toggleTimer')
})

it('pauses on blur', async () => {
  store.commit('workviewTracker/START_TIMER')

  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })

  window.dispatchEvent(new Event('blur'))
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/pause')
})

it('continues on focus', async () => {
  store.commit('workviewTracker/START_TIMER')
  store.commit('workviewTracker/PAUSE_TIMER')

  const wrapper = shallowMount(WorkTracker, { localVue, propsData, store, stubs })

  window.dispatchEvent(new Event('focus'))
  await wrapper.vm.$nextTick()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/unpause')
})

it('reports activity on topic change, if timer already running', async () => {
  propsData.topic = 'foo'

  // no activity on mount
  const wrapper = shallowMount(WorkTracker, { localVue, propsData, mocks, store, stubs })
  await flushPromises()
  expect(store.dispatch).not.toHaveBeenCalledWith('workviewTracker/reportActivity')

  // no activity while timer stopped
  await wrapper.setProps({ topic: 'bar' })
  await flushPromises()
  expect(store.dispatch).not.toHaveBeenCalledWith('workviewTracker/reportActivity')

  // report activity on topic change with timer started
  store.commit('workviewTracker/START_TIMER')
  await wrapper.setProps({ topic: 'baz' })
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/reportActivity')
})

it('does not report activity on initial topic', async () => {
  store.commit('workviewTracker/START_TIMER')
  shallowMount(WorkTracker, { localVue, propsData, mocks, store, stubs })
  await flushPromises()
  expect(store.dispatch).not.toHaveBeenCalledWith('workviewTracker/reportActivity')
})

it('immediately pauses timer if component is mounted while document blurred', async () => {
  const spy = jest.spyOn(document, 'hasFocus').mockReturnValue(false)
  shallowMount(WorkTracker, { localVue, propsData, mocks, store, stubs })
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/pause')
  spy.mockReset()
})

it('ensures timer is not paused if component is mounted while document in focus', async () => {
  const spy = jest.spyOn(document, 'hasFocus').mockReturnValue(true)
  shallowMount(WorkTracker, { localVue, propsData, mocks, store, stubs })
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('workviewTracker/unpause')
  spy.mockReset()
})
