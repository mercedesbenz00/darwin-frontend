import { createLocalVue, shallowMount } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'
import { emitRootStub, rootStubProps } from 'test/unit/testHelpers'

import UpdateButton from '@/components/Models/ModelManagement/UpdateButton.vue'
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

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(UpdateButton, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itRendersCorrectText = (regular: string, hover: string) => {
  it('renders correct text', () => {
    const wrapper = shallowMount(UpdateButton, { localVue, propsData, store })
    expect(rootStubProps(wrapper, 'text')).toEqual(regular)
    expect(rootStubProps(wrapper, 'hoverText')).toEqual(hover)
  })
}

describe('when starting', () => {
  beforeEach(() => {
    propsData.runningSession.meta.num_instances_starting = 1
    propsData.runningSession.max = 1
  })

  itMatchesSnapshot()
  itRendersCorrectText('Starting', 'Update')
})

describe('when running', () => {
  beforeEach(() => {
    propsData.runningSession.meta.num_instances_available = 1
    propsData.runningSession.max = 1
  })

  itMatchesSnapshot()
  itRendersCorrectText('Running', 'Update')
})

describe('when stopping', () => {
  beforeEach(() => {
    propsData.runningSession.meta.num_instances_available = 1
    propsData.runningSession.max = 0
  })

  itMatchesSnapshot()
  itRendersCorrectText('Stopping', 'Update')
})

describe('when stopped', () => {
  beforeEach(() => {
    propsData.runningSession.meta.num_instances_starting = 0
    propsData.runningSession.meta.num_instances_available = 0
    propsData.runningSession.max = 0
  })

  itMatchesSnapshot()
  itRendersCorrectText('Start', 'Start')
})

it('selects trained model on click', async () => {
  const wrapper = shallowMount(UpdateButton, { localVue, propsData, store })

  expect(store.state.neuralModel.selectedRunningSession).toBeNull()
  await emitRootStub(wrapper, 'click')
  expect(store.state.neuralModel.selectedRunningSession).toEqual(propsData.runningSession)
})
