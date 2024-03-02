import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildCommentThread,
  buildDatasetImagePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload,
  buildLoadedVideo,
  buildUserPayload,
  buildWorkflowStagePayload
} from 'test/unit/factories'

import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import { ItemManager, CommentManager } from '@/engine/managers'
import { boundingBoxToVertices } from '@/engineCommon/comment'
import { DatasetItemPayload, UserPayload, WorkflowStagePayload } from '@/store/types'

let store: ReturnType<typeof createTestStore>
let editor: Editor
let commentManager: CommentManager
let sam: UserPayload
let itemManager: ItemManager

const localVue = createLocalVue()
localVue.use(Vuex)

const stage: WorkflowStagePayload = buildWorkflowStagePayload({ id: 1 })

const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  itemManager = new ItemManager(store)
  const editor = new Editor(itemManager, store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  sam = buildUserPayload({ id: 75 })
  store.commit('user/SET_PROFILE', sam)
  editor = initEditor(store)
  const dataset = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(dataset, []))

  connectStore(store, editor)
  jest.spyOn(editor.camera, 'scaleToFit').mockImplementation(() => {})
  commentManager = new CommentManager(editor.activeView)
})

describe('createCommentThread', () => {
  const params = boundingBoxToVertices({ x: 5, y: 5, w: 20, h: 20 })

  describe('when no item', () => {
    it('does nothing', async () => {
      await commentManager.createCommentThread(params)
      expect(store.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('with image item', () => {
    let item: DatasetItemPayload

    beforeEach(() => {
      const datasetImage = buildDatasetImagePayload({ id: 21 })
      item = buildDatasetItemPayload({ id: 19, dataset_image_id: 21, dataset_image: datasetImage })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    })

    it('dispatches store action', async () => {
      await commentManager.createCommentThread(params)
      expect(store.dispatch).toHaveBeenCalledWith(
        'comment/addUnsavedCommentThread',
        expect.objectContaining({
          authorId: sam.id,
          workflowId: stage.workflow_id
        })
      )
    })
  })

  describe('with video item', () => {
    let item: DatasetItemPayload

    beforeEach(() => {
      const datasetVideo = buildDatasetVideoPayload({ id: 2, annotate_as_video: true })
      item = buildDatasetItemPayload({
        dataset_id: 1,
        dataset_video: datasetVideo,
        dataset_video_id: 3,
        seq: 4
      })
      editor.activeView.currentItem = item
      editor.loadedVideo = buildLoadedVideo({ currentFrameIndex: 5 })
    })

    it('dispatches store action', async () => {
      await commentManager.createCommentThread(params)
      expect(store.dispatch).toHaveBeenCalledWith(
        'comment/addUnsavedCommentThread',
        expect.objectContaining({
          authorId: sam.id,
          frameIndex: 5,
          workflowId: stage.workflow_id
        })
      )
    })
  })
})

describe('commentThreads', () => {
  describe('when no item', () => {
    it('returns []', () => {
      expect(editor.activeView.commentManager.commentThreads).toEqual([])
    })
  })

  describe('with image item', () => {
    let item: DatasetItemPayload

    beforeEach(() => {
      const datasetImage = buildDatasetImagePayload({ id: 21 })
      item = buildDatasetItemPayload({ id: 19, dataset_image_id: 21, dataset_image: datasetImage })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    })

    it('returns all unresolved threads', () => {
      commentManager = new CommentManager(editor.activeView)

      const commentThreads = [
        buildCommentThread({ id: 1, workflow_id: 1, resolved: false }),
        buildCommentThread({ id: 2, workflow_id: 1, resolved: true }),
        buildCommentThread({ id: 3, workflow_id: 1, resolved: false })
      ]
      store.commit('comment/SET_THREADS', commentThreads)
      expect(editor.activeView.commentManager.commentThreads.length).toEqual(2)
    })
  })

  describe('with video item', () => {
    let item: DatasetItemPayload

    beforeEach(async () => {
      jest.spyOn(itemManager, 'loadItem').mockResolvedValue({
        data: buildLoadedVideo({ currentFrameIndex: 1 })
      })

      const datasetVideo = buildDatasetVideoPayload({ id: 2, annotate_as_video: true })
      item = buildDatasetItemPayload({
        id: 111,
        dataset_id: 1,
        dataset_video: datasetVideo,
        dataset_video_id: 3,
        seq: 4
      })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      await flushPromises()
    })

    it('returns all unresolved threads for current frame', () => {
      const commentThreads = [
        buildCommentThread({ id: 1, workflow_id: 1, frame_index: 1, resolved: false }),
        buildCommentThread({ id: 2, workflow_id: 1, frame_index: 1, resolved: true }),
        buildCommentThread({ id: 3, workflow_id: 1, frame_index: 1, resolved: false }),
        buildCommentThread({ id: 1, workflow_id: 1, frame_index: 2, resolved: false })
      ]
      store.commit('comment/SET_THREADS', commentThreads)
      expect(editor.activeView.commentManager.commentThreads.length).toEqual(2)
    })
  })
})
