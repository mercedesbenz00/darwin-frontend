import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { advanceTo, clear } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import PublicRunningSessionButton from '@/components/Models/ModelManagement/PublicRunningSessionButton.vue'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let propsData: { runningSession: RunningSessionPayload }
let store: ReturnType<typeof createTestStore>

const aFewSecondsAgo = '2020-05-05T01:02:00Z'
const now = '2020-05-05T01:02:03Z'

beforeEach(() => {
  store = createTestStore()
  propsData = {
    runningSession: buildRunningSessionPayload({
      id: 'running-session',
      inserted_at: aFewSecondsAgo,
      updated_at: aFewSecondsAgo
    })
  }
  advanceTo(now)
})

afterEach(() => clear())

it('matches snapshot', () => {
  const wrapper = shallowMount(PublicRunningSessionButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('shows a pill notification on click', async () => {
  const wrapper = shallowMount(PublicRunningSessionButton, { localVue, propsData, store })

  expect(store.state.neuralModel.selectedRunningSession).toBeNull()
  await emitRootStub(wrapper, 'click')
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
})
