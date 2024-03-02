import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { updateVideoAnnotationSegmentsAction } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)
})

it('converts floats to integers', async () => {
  jest
    .spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
  editor.activeView.loadedVideo = { frames: { 0: {}, 10: {} } } as any
  // Used as a quick way to define an annotation that doesn't cause an oom error
  // We should replace this with a proper annotation when possible.
  const annotationData = { segments: [[4, 10]], frames: { 4: {}, 9: {}}}
  const annotation = { data: annotationData } as unknown as Annotation
  const action = updateVideoAnnotationSegmentsAction(editor.activeView, annotation, [0.4, 0.6])
  await action.do()
  expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalledWith({
    data: { frames: annotationData.frames, segments: [[0, 1]] }
  })
})

it('updates single-segment video annotation frames', async () => {
  jest
    .spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
  editor.activeView.loadedVideo = { frames: { 0: {}, 15: {} } } as any
  const annotationData = { segments: [[0, 1]], frames: { 0: {}, 1: {}}}
  const annotation = { data: annotationData } as unknown as Annotation
  const action = updateVideoAnnotationSegmentsAction(editor.activeView, annotation, [1, 2])
  await action.do()
  expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalledWith({
    // Note: we only expect 1 frame now, as one of them is pushed off
    // the end of the video, which is only 2 frames long.
    data: { frames: { 1: {} }, segments: [[1, 2]] }
  })
})

it('updates multi-segment video annotation frames', async () => {
  jest
    .spyOn(editor.activeView.annotationManager, 'persistUpdateAnnotation')
  editor.activeView.loadedVideo = { frames: { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} } } as any
  const annotationData = { segments: [[0, 1], [2, 3]], frames: { 0: {}, 2: {}}}
  const annotation = { data: annotationData } as unknown as Annotation
  const action = updateVideoAnnotationSegmentsAction(editor.activeView, annotation, [2, 5])
  await action.do()
  expect(editor.activeView.annotationManager.persistUpdateAnnotation).toHaveBeenCalledWith({
    data: { frames: { 2: {}, 4: {} }, segments: [[2, 3], [4, 5]] }
  })
})
