import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { DatasetItemFilter, DatasetItemStatus, DatasetItemType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'dataset/PUSH_DATASET_ITEMS'

it('pushes items to store', () => {
  const items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 })
  ]

  store.commit(MUTATION, items)
  expect(store.state.dataset.datasetItems).toEqual(items)
})

it('replaces existing items in the store', () => {
  const items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 })
  ]

  store.commit(MUTATION, items)
  store.commit(MUTATION, [items[0]])
  store.commit(MUTATION, [items[1]])
  store.commit(MUTATION, items)

  expect(store.state.dataset.datasetItems).toEqual(items)
})

it('does not add items if they are filtered out by status', () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.new] })
  const item = buildDatasetItemPayload({ status: DatasetItemStatus.annotate })
  store.commit(MUTATION, [item])
  expect(store.state.dataset.datasetItems).toEqual([])
})

it('does not add items if they are filtered out by path', () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/' })
  const item = buildDatasetItemPayload({ path: '/test' })
  store.commit(MUTATION, [item])
  expect(store.state.dataset.datasetItems).toEqual([])
})

it('does not add items if they are filtered out by assignees', () => {
  const filter: DatasetItemFilter = { assignees: [1, 2, 3] }
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)

  const [item1, item2, item3, item4] = [
    initializeARWorkflow({ id: 1 }),
    initializeARWorkflow({ id: 2 }),
    initializeARWorkflow({ id: 3 }),
    initializeARWorkflow({ id: 4 })
  ]

  item1.current_workflow!.stages[1][0].assignee_id = 1
  item2.current_workflow!.stages[2][0].assignee_id = 2
  item3.current_workflow!.stages[3][0].assignee_id = 3

  store.commit(MUTATION, [item1, item2, item3, item4])
  expect(store.state.dataset.datasetItems).toEqual([item1, item2, item3])
})

it('does not add items if they are filtered out by type', () => {
  const [image, playbackVideo, splitVideo, videoFrame] = [
    buildDatasetItemPayload({ id: 1, type: DatasetItemType.image }),
    buildDatasetItemPayload({ id: 2, type: DatasetItemType.playbackVideo }),
    buildDatasetItemPayload({ id: 3, type: DatasetItemType.splitVideo }),
    buildDatasetItemPayload({ id: 4, type: DatasetItemType.videoFrame })
  ]

  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { types: [DatasetItemType.image] })
  store.commit(MUTATION, [image, playbackVideo, splitVideo, videoFrame])
  expect(store.state.dataset.datasetItems).toEqual([image])

  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { types: [DatasetItemType.videoFrame] })
  store.commit(MUTATION, [image, playbackVideo, splitVideo, videoFrame])
  expect(store.state.dataset.datasetItems).toEqual([videoFrame])

  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { types: [DatasetItemType.playbackVideo] })
  store.commit(MUTATION, [image, playbackVideo, splitVideo, videoFrame])
  expect(store.state.dataset.datasetItems).toEqual([playbackVideo])

  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { types: [DatasetItemType.splitVideo] })
  store.commit(MUTATION, [image, playbackVideo, splitVideo, videoFrame])
  expect(store.state.dataset.datasetItems).toEqual([splitVideo])
})

it('does not add items if they are filtered out by stage template', () => {
  const [item1, item2, item3, item4] = [
    initializeARWorkflow({ id: 1 }),
    initializeARWorkflow({ id: 2 }),
    initializeARWorkflow({ id: 3 }),
    initializeARWorkflow({ id: 4 })
  ]

  item1.current_workflow!.current_workflow_stage_template_id = 1
  item2.current_workflow!.current_workflow_stage_template_id = 2
  item3.current_workflow!.current_workflow_stage_template_id = 3
  item4.current_workflow!.current_workflow_stage_template_id = 4

  const filter: DatasetItemFilter = { workflow_stage_template_ids: [1, 2, 3] }
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
  store.commit(MUTATION, [item1, item2, item3, item4])
  expect(store.state.dataset.datasetItems).toEqual([item1, item2, item3])
})

it('does not add items if they are filtered out by video id', () => {
  const [item1, item2, item3, item4] = [
    initializeARWorkflow({ id: 1, dataset_video_id: 11 }),
    initializeARWorkflow({ id: 2, dataset_video_id: 12 }),
    initializeARWorkflow({ id: 3, dataset_video_id: 13 }),
    initializeARWorkflow({ id: 4, dataset_video_id: 14 })
  ]

  const filter: DatasetItemFilter = { video_ids: [11, 12, 13] }
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', filter)
  store.commit(MUTATION, [item1, item2, item3, item4])
  expect(store.state.dataset.datasetItems).toEqual([item1, item2, item3])
})

it('selects items if selectAll is active', () => {
  const items = [
    buildDatasetItemPayload({ id: 1 }),
    buildDatasetItemPayload({ id: 2 })
  ]
  store.commit(MUTATION, items)

  expect(store.state.dataset.selectedItemIds).toEqual([])

  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)
  const moreItems = [
    buildDatasetItemPayload({ id: 3 }),
    buildDatasetItemPayload({ id: 4 })
  ]
  store.commit(MUTATION, moreItems)

  expect(store.state.dataset.selectedItemIds).toEqual([1, 2, 3, 4])
})
