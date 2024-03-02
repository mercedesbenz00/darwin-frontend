import { createLocalVue, shallowMount } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'
import { v4 as uuidv4 } from 'uuid'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildTrainingSessionPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import TrainingButton from '@/components/Models/ModelManagement/TrainingButton.vue'
import { TrainingSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)
let propsData: { trainingSession: TrainingSessionPayload }
let store: ReturnType<typeof createTestStore>

const aFewSecondsAgo = '2020-05-05T01:02:00Z'
const now = '2020-05-05T01:02:03Z'

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(TrainingButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

const itDispatchesToastOnClick = (content: string) => {
  it('dispatches toast on click', async () => {
    const wrapper = shallowMount(TrainingButton, { localVue, propsData, store })
    await emitRootStub(wrapper, 'click')
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', {
      content: expect.stringContaining(content)
    })
  })
}

describe('when training', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainingSession: buildTrainingSessionPayload({ id: 'training-session', inserted_at: aFewSecondsAgo })
    }
    advanceTo(now)
  })

  afterEach(() => clear())

  itMatchesSnapshot()
  itDispatchesToastOnClick("hasn't finished training")
})

describe('when crashed', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainingSession: buildTrainingSessionPayload({ id: 'training-session', status: 'crashed', inserted_at: aFewSecondsAgo })
    }
    advanceTo(now)
  })

  afterEach(() => clear())

  itMatchesSnapshot()
  itDispatchesToastOnClick('crashed')
})

describe('when scheduled', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainingSession: buildTrainingSessionPayload({
        id: 'training-session',
        gust: {
          status: 'scheduled',
          id: uuidv4(),
          current_running_session_id: null,
          mode: 'train'
        },
        status: 'pending',
        inserted_at: aFewSecondsAgo
      })
    }
    advanceTo(now)
  })

  afterEach(() => clear())

  itMatchesSnapshot()
  itDispatchesToastOnClick('be trained soon')
})

describe('when gust stopped (treated as crashed)', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainingSession: buildTrainingSessionPayload({
        id: 'training-session',
        gust: {
          status: 'stopped',
          id: uuidv4(),
          current_running_session_id: null,
          mode: 'train'
        },
        status: 'pending',
        inserted_at: aFewSecondsAgo
      })
    }
    advanceTo(now)
  })

  afterEach(() => clear())

  itMatchesSnapshot()
  itDispatchesToastOnClick('crashed')
})
