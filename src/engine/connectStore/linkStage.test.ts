import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildStageAnnotationPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StageAnnotationPayload } from '@/store/types/StageAnnotationPayload'

import { linkStage } from './linkStage'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let stagePayload: StageAnnotationPayload

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  stagePayload = buildStageAnnotationPayload({
    annotation_class_id: 1,
    workflow_stage_id: 1
  })

  linkStage(store, editor)
})

it('workview/REMOVE_STAGE_ANNOTATIONS should trigger AnnotationManager.handleRemoveAnnotations', () => {
  jest.spyOn(editor.activeView.annotationManager, 'handleRemoveAnnotations')

  store.commit('workview/REMOVE_STAGE_ANNOTATIONS', [stagePayload])

  expect(editor.activeView.annotationManager.handleRemoveAnnotations)
    .toHaveBeenCalledWith([stagePayload])
})
