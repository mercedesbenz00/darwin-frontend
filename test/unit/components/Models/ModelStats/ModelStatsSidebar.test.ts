import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainedModelPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import ModelStatsSidebar from '@/components/Models/ModelStats/ModelStatsSidebar.vue'
import { TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainedModel: TrainedModelPayload | null
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ModelStatsSidebar, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when trainedModel is null', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = { trainedModel: null }
  })

  itMatchesSnapshot()
})

describe('when trainedModel is defined, no associated training session', () => {
  beforeEach(() => {
    store = createTestStore()
    propsData = {
      trainedModel: buildTrainedModelPayload({
        training_result: {
          segm: {
            AP: 50,
            AP50: 75,
            AP75: 60
          }
        }
      })
    }
  })

  itMatchesSnapshot()
})

describe('when trainedModel is defined, with associated training session in store', () => {
  beforeEach(() => {
    store = createTestStore()

    const trainedModel = buildTrainedModelPayload({
      id: 'trained-model-id',
      training_result: {
        segm: {
          AP: 50,
          AP50: 75,
          AP75: 60
        }
      }
    })

    store.commit('neuralModel/SET_TRAINING_SESSIONS', [
      buildTrainingSessionPayload({
        dataset_identifier: 'team-slug/dataset-slug',
        inserted_at: (new Date(2021, 3, 31, 16, 1, 30)).toUTCString(),
        trained_model_id: trainedModel.id,
        training_stats: {
          train: {
            item_count: 123,
            class_distribution: {},
            instance_distribution: {},
            frame_count: 0,
            split_percentage: 0.8
          },
          val: {
            item_count: 15,
            class_distribution: {},
            instance_distribution: {},
            frame_count: 0,
            split_percentage: 0.1
          },
          test: {
            item_count: 15,
            class_distribution: {},
            instance_distribution: {},
            frame_count: 0,
            split_percentage: 0.1
          },
          max_density: 150,
          split_seed: 0
        },
        // 2 days, 3 hours, 54 minutes
        training_time_secs: 2 * 24 * 60 * 60 + 3 * 60 * 60 + 54 * 60
      })
    ])

    propsData = { trainedModel }
  })

  itMatchesSnapshot()
})
