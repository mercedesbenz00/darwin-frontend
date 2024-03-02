import { createLocalVue } from '@vue/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

jest.mock('@/utils/backend', () => ({ setDatasetItemsStage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const createFile = (name?: string) => new File([''], name || uuidv4(), { type: 'image/png' })

const files = [1, 2, 3].map(i => i.toString()).map(createFile)

beforeEach(() => {
  store = createTestStore()
})

it('adds files to to a blank state', () => {
  store.commit('datasetUpload/ADD_FILES', files.slice(0, 2))
  expect(store.state.datasetUpload.files.length).toEqual(2)
})

it('adds files to a state which already contains files', () => {
  store.commit('datasetUpload/ADD_FILES', [files[0]])
  store.commit('datasetUpload/ADD_FILES', [files[0], files[1]])
  expect(store.state.datasetUpload.files.length).toEqual(2)
})
