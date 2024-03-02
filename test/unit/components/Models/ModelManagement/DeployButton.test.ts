import { createLocalVue, shallowMount } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainedModelPayload } from 'test/unit/factories'
import { emitRootStub } from 'test/unit/testHelpers'

import DeployButton from '@/components/Models/ModelManagement/DeployButton.vue'
import { TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
let propsData: { trainedModel: TrainedModelPayload }
let store: ReturnType<typeof createTestStore>

const aFewSecondsAgo = '2020-05-05T01:02:00Z'
const now = '2020-05-05T01:02:03Z'

beforeEach(() => {
  store = createTestStore()
  propsData = {
    trainedModel: buildTrainedModelPayload({ id: 'trained-model', inserted_at: aFewSecondsAgo })
  }
  advanceTo(now)
})

afterEach(() => clear())

it('matches snapshot', () => {
  const wrapper = shallowMount(DeployButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('selects trained model on click', async () => {
  const wrapper = shallowMount(DeployButton, { localVue, propsData, store })

  expect(store.state.neuralModel.selectedTrainedModel).toBeNull()
  await emitRootStub(wrapper, 'click')
  expect(store.state.neuralModel.selectedTrainedModel).toEqual(propsData.trainedModel)
})
