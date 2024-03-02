import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'

import { DatasetItemType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'workview/SET_DATASET_ITEM_FILENAMES'

it('pushes filenames to store', () => {
  const filenames = [
    buildDatasetItemPayload({ id: 1, filename: '1.jpg' }),
    buildDatasetItemPayload({
      id: 2,
      filename: '2.mpg',
      type: DatasetItemType.playbackVideo
    })
  ]

  store.commit(MUTATION, filenames)
  expect(store.state.workview.datasetItemFilenames).toEqual(filenames)
})
