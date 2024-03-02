import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import UndeployButton from '@/components/Models/UndeployButton.vue'
import { installCommonComponents } from '@/plugins/components'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: {
  runningSession: RunningSessionPayload
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    runningSession: buildRunningSessionPayload()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(UndeployButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches deploy action on click', async () => {
  const wrapper = shallowMount(UndeployButton, { localVue, propsData, store })
  await emitRootStub(wrapper, 'click')
  const { runningSession } = propsData
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/undeployModel', { runningSession })
})

it('dispatches toast error on deploy error', async () => {
  const wrapper = shallowMount(UndeployButton, { localVue, propsData, store })

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ error: { message: 'Fake error' } })

  await emitRootStub(wrapper, 'click')

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})
