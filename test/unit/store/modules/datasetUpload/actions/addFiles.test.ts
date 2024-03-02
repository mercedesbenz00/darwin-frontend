import { createLocalVue } from '@vue/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const createFile = (name?: string) => new File([''], name || uuidv4(), { type: 'image/png' })

beforeEach(() => {
  store = createUnstubbedTestStore()
})

it('adds files to to a state', async () => {
  await store.dispatch('datasetUpload/addFiles', [createFile(), createFile()])
  expect(store.state.datasetUpload.files.length).toEqual(2)
  await store.dispatch('datasetUpload/addFiles', [createFile()])
  expect(store.state.datasetUpload.files.length).toEqual(3)
})

it('detects duplicates', async () => {
  const [fileA, fileB] = ['a', 'b'].map(createFile)

  await store.dispatch('datasetUpload/addFiles', [fileA])
  expect(store.state.datasetUpload.files).toHaveLength(1)

  await store.dispatch('datasetUpload/addFiles', [fileA])
  expect(store.state.datasetUpload.files).toHaveLength(1)

  await store.dispatch('datasetUpload/addFiles', [fileB])
  expect(store.state.datasetUpload.files.length).toEqual(2)
})
