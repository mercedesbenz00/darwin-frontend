import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildStageAnnotation } from 'test/unit/factories/buildStageAnnotation'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'

import { linkAnnotations } from './linkAnnotations'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let editor: Editor

beforeEach(() => {
  store = createTestStore()
  editor = new Editor(new ItemManager(store), store)

  linkAnnotations(store, editor)
})

it('workview/UPDATE_STAGE_ANNOTATION should trigger View.annotationManager.setAnnotations', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'setAnnotations')
    .mockImplementation(() => {})

  store.commit('workview/UPDATE_STAGE_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.setAnnotations).toHaveBeenCalled
})
it('workview/HIGHLIGHT_ANNOTATION should trigger View.annotationManager.handleHighlightAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleHighlightAnnotation')
    .mockImplementation(() => {})

  store.commit('workview/HIGHLIGHT_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleHighlightAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/UNHIGHLIGHT_ANNOTATION should trigger View.annotationManager.handleUnhighlightAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleUnhighlightAnnotation')
    .mockImplementation(() => {})

  store.commit('workview/UNHIGHLIGHT_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleUnhighlightAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/UNHIGHLIGHT_ALL_ANNOTATIONS should trigger View.annotationManager.handleUnhighlightAllAnnotations', () => {
  jest.spyOn(editor.activeView.annotationManager, 'handleUnhighlightAllAnnotations')
    .mockImplementation(() => {})

  store.commit('workview/UNHIGHLIGHT_ALL_ANNOTATIONS')

  expect(editor.activeView.annotationManager.handleUnhighlightAllAnnotations)
    .toHaveBeenCalled()
})

it('workview/SELECT_ANNOTATION should trigger View.annotationManager.handleSelectAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleSelectAnnotation')
    .mockImplementation(() => {})

  store.commit('workview/SELECT_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleSelectAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/DESELECT_ANNOTATION should trigger View.annotationManager.handleDeselectAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleDeselectAnnotation')

  store.commit('workview/DESELECT_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleDeselectAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/DESELECT_ALL_ANNOTATIONS should trigger View.annotationManager.handleDeselectAllAnnotations', () => {
  jest.spyOn(editor.activeView.annotationManager, 'handleDeselectAllAnnotations')

  store.commit('workview/DESELECT_ALL_ANNOTATIONS')

  expect(editor.activeView.annotationManager.handleDeselectAllAnnotations)
    .toHaveBeenCalled()
})

it('workview/SHOW_ANNOTATION should trigger View.annotationManager.handleShowAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleShowAnnotation')

  store.commit('workview/SHOW_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleShowAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/HIDE_ANNOTATION should trigger View.annotationManager.handleHideAnnotation', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'handleHideAnnotation')

  store.commit('workview/HIDE_ANNOTATION', stageAnnotation)

  expect(editor.activeView.annotationManager.handleHideAnnotation)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/UPDATE_ANNOTATIONS_VISIBILITY should trigger View.annotationManager.updateAnnotationsVisibility', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'updateAnnotationsVisibility')

  store.commit('workview/UPDATE_ANNOTATIONS_VISIBILITY', stageAnnotation)

  expect(editor.activeView.annotationManager.updateAnnotationsVisibility)
    .toHaveBeenCalledWith(stageAnnotation)
})

it('workview/TOGGLE_ANNOTATIONS should trigger View.annotationManager.updateAnnotationsVisibility', () => {
  jest.spyOn(editor.activeView.annotationManager, 'handleToggleAnnotations')

  store.commit('workview/TOGGLE_ANNOTATIONS')

  expect(editor.activeView.annotationManager.handleToggleAnnotations)
    .toHaveBeenCalled()
})

it('workview/CLEAR_STAGE_ANNOTATIONS should trigger View.annotationManager.cleanup', () => {
  const stageAnnotation = buildStageAnnotation({})
  jest.spyOn(editor.activeView.annotationManager, 'cleanup')

  store.commit('workview/CLEAR_STAGE_ANNOTATIONS', stageAnnotation)

  expect(editor.activeView.annotationManager.cleanup)
    .toHaveBeenCalled()
})
