import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import TrackerOfflineDialog from '@/components/WorkView/Tracker/TrackerOfflineDialog.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

const mocks = { $theme: createMockTheme() }
let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const wrapper = shallowMount(TrackerOfflineDialog, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('shows modal after 10s from errored', async () => {
  jest.useFakeTimers()

  const wrapper = shallowMount(TrackerOfflineDialog, { localVue, mocks, store })
  const component = wrapper.vm as any
  jest.spyOn(component.$modal, 'show').mockReturnValue({})
  store.commit('workviewTracker/SET_STATUS', 'error')

  await wrapper.vm.$nextTick()
  jest.advanceTimersByTime(10000)

  expect(component.$modal.show).toBeCalledWith('tracker-offline-modal')
})

it('reload the windows when refresh is clicked', async () => {
  const { location } = window
  Object.defineProperty(window, 'location', {
    value: { reload: jest.fn().mockResolvedValue(undefined) }
  })

  const wrapper = shallowMount(TrackerOfflineDialog, { localVue, mocks, store })
  await wrapper.find('custom-button-stub').vm.$emit('click')
  expect(window.location.reload).toBeCalled()
  Object.defineProperty(window, 'location', { value: location })
})
