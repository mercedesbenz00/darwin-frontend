import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildWorkflowStagePayload,
  buildStageAnnotationPayload
} from 'test/unit/factories'

import { connectStore } from '@/engine/connectStore'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { IAnnotationManager } from '@/engine/managers/IAnnotationManager'
import { WorkflowStagePayload } from '@/store/types'

let store: ReturnType<typeof createTestStore>
let editor: Editor
let annotationManager: IAnnotationManager

const localVue = createLocalVue()
localVue.use(Vuex)

const stage: WorkflowStagePayload = buildWorkflowStagePayload({ id: 1 })

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})
const tag = buildAnnotationClassPayload({
  id: 2,
  name: 'tag',
  annotation_types: ['tag'],
  datasets: [{ id: sfh.id }]
})

const flaskAnnotationPayload1 = buildStageAnnotationPayload({
  id: 'annotation1',
  annotation_class_id: flask.id,
  data: { polygon: { path: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }] } },
  z_index: 2,
  workflow_stage_id: stage.id
})

const flaskAnnotationPayload2 = buildStageAnnotationPayload({
  id: 'annotation2',
  annotation_class_id: flask.id,
  data: { polygon: { path: [{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 60 }] } },
  z_index: 1,
  workflow_stage_id: stage.id
})

const flaskAnnotationPayload3 = buildStageAnnotationPayload({
  id: 'annotation3',
  annotation_class_id: flask.id,
  data: { polygon: { path: [{ x: 100, y: 200 }, { x: 300, y: 400 }, { x: 500, y: 600 }] } },
  z_index: 3,
  workflow_stage_id: stage.id
})

const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/SET_DATASET', sfh)
  store.commit('aclass/SET_CLASSES', [flask, tag])
  const editor = new Editor(new ItemManager(store), store)
  connectStore(store, editor)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
})

describe('test setAnnotations', () => {
  it('setAnnotations keep annotations as sorted by zIndex', () => {
    jest.spyOn(store, 'subscribe').mockReturnValue(() => undefined)
    store.commit('aclass/SET_CLASSES', [flask, tag])
    editor = initEditor(store)
    store.commit('workview/SET_STAGE_ANNOTATIONS', {
      annotations: [flaskAnnotationPayload2, flaskAnnotationPayload1],
      stage
    })
    annotationManager = editor.activeView.annotationManager

    annotationManager.setAnnotations(
      store.getters['workview/sortedAnnotationsByStage'](stage)
    )
    expect(annotationManager.annotations).toHaveLength(2)
    expect(annotationManager.annotations[0].id).toBe('annotation1')
    expect(annotationManager.annotations[0].zIndex).toBe(2)
    expect(annotationManager.annotations[1].id).toBe('annotation2')
    expect(annotationManager.annotations[1].zIndex).toBe(1)
  })
})

describe('test store subscribers', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES', [flask])
    editor = initEditor(store)
    store.commit('workview/SET_STAGE_ANNOTATIONS', {
      annotations: [flaskAnnotationPayload2, flaskAnnotationPayload1, flaskAnnotationPayload3],
      stage
    })
    annotationManager = editor.activeView.annotationManager
    annotationManager.setAnnotations(
      store.getters['workview/sortedAnnotationsByStage'](stage)
    )
  })

  it('workview/REMOVE_STAGE_ANNOTATIONS', () => {
    expect(annotationManager.annotations).toHaveLength(3)
    store.commit(
      'workview/REMOVE_STAGE_ANNOTATIONS',
      [
        annotationManager.annotations[0].serialize(),
        annotationManager.annotations[1].serialize()
      ]
    )
    expect(annotationManager.annotations).toHaveLength(1)

    expect(annotationManager.annotations[0].id).toBe('annotation2')
    expect(annotationManager.annotations[0].zIndex).toBe(1)
  })
})
