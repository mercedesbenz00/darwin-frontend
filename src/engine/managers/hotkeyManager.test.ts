import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildLoadedFrame,
  buildMembershipPayload,
  buildTeamPayload,
  buildUserPayload
} from 'test/unit/factories'
import { flask, tag } from 'test/unit/fixtures/annotation-class-payloads'

import { Editor } from '@/engine/editor'
import { ItemManager, HotkeyManager } from '@/engine/managers'
import { Annotation } from '@/engine/models'
import { AnnotationClass } from '@/engineCommon/AnnotationClass'
import { MembershipPayload, TeamPayload, UserPayload } from '@/store/types'
import { getDatasetHotkeys } from '@/utils'

let store: ReturnType<typeof createTestStore>
let editor: Editor
let hotkeyManager: HotkeyManager

const localVue = createLocalVue()
localVue.use(Vuex)

const initEditor = (store: ReturnType<typeof createTestStore>): Editor => {
  const editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

describe('registerDefaultHotkeyListeners', () => {
  it('runs without any issues', () => {
    store = createTestStore()
    editor = initEditor(store)
    hotkeyManager = new HotkeyManager(editor)
    expect(hotkeyManager.listeners.length).toEqual(0)
    hotkeyManager.registerDefaultHotkeyListeners()
    expect(hotkeyManager.listeners.length).toEqual(20)
  })
})

describe('register annotation class hotkeys', () => {
  it('registers valid hotkeys list', () => {
    const dataset = buildDatasetPayload({ id: 1, annotation_hotkeys: {} })
    const annotationClasses = [
      buildAnnotationClassPayload({
        id: 1,
        datasets: [{ id: dataset.id }],
        annotation_types: ['bounding_box'],
        metadata: { _color: 'rgba(0, 0, 0, 0.1)' }
      }),
      buildAnnotationClassPayload({
        id: 2,
        datasets: [{ id: dataset.id }],
        annotation_types: ['bounding_box'],
        metadata: { _color: 'rgba(0, 0, 0, 0.1)' }
      }),
      buildAnnotationClassPayload({
        id: 3,
        datasets: [{ id: dataset.id }],
        annotation_types: ['tag'],
        metadata: { _color: 'rgba(0, 0, 0, 0.1)' }
      })
    ]
    store = createTestStore()
    setDefaultAnnotationTypes(store)
    store.commit('workview/SET_DATASET', dataset)
    store.commit('aclass/SET_CLASSES', annotationClasses)
    editor = initEditor(store)
    editor.activeView.setAnnotationClasses(store.state.aclass.classes)

    hotkeyManager = new HotkeyManager(editor)
    hotkeyManager.setHotkeys(getDatasetHotkeys({
      annotationClasses, dataset
    }))

    expect(hotkeyManager.listeners.length).toEqual(0)
    hotkeyManager.registerAnnotationClassHotkeys()
    expect(hotkeyManager.listeners.length).toEqual(1)

    jest.spyOn(editor, 'activateTool').mockReturnValue(undefined)
    jest.spyOn(store, 'commit').mockReturnValue(undefined)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    expect(editor.activateTool).toBeCalledWith('bounding_box_tool')
    expect(store.commit).toBeCalledWith('workview/PRESELECT_CLASS_ID', 1)
  })
})

describe('cleanup', () => {
  it('removes all listeners', () => {
    store = createTestStore()
    editor = initEditor(store)
    hotkeyManager = new HotkeyManager(editor)
    expect(hotkeyManager.listeners.length).toEqual(0)
    hotkeyManager.registerDefaultHotkeyListeners()
    expect(hotkeyManager.listeners.length).toEqual(20)
    hotkeyManager.cleanup()
    expect(hotkeyManager.listeners.length).toEqual(0)
  })
})

describe('$on', () => {
  beforeEach(() => {
    store = createTestStore()
    editor = initEditor(store)
    hotkeyManager = new HotkeyManager(editor)
  })

  it('registers key event listener for single keydown', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a' }, listener)

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(listener).toBeCalled()
  })

  it('registers key event listener for single keypress', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a' }, listener, { type: 'keypress' })

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keypress', { key: 'a' }))
    expect(listener).toBeCalled()
  })

  it('registers key event listener for single keyup', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a' }, listener, { type: 'keyup' })

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))
    expect(listener).toBeCalled()
  })

  it('registers key event listener for keydown with several keys', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: ['a', 'b'] }, listener)

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
    expect(listener).toBeCalledTimes(2)
  })

  it('registers key event listener with metaKey', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a', metaKey: true }, listener)

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }))
    expect(listener).toBeCalled()
  })

  it('registers key event listener with metaKey', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a', metaKey: true }, listener)

    expect(hotkeyManager.listeners.length).toEqual(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(listener).not.toBeCalled()
  })
})

describe('$off', () => {
  beforeEach(() => {
    store = createTestStore()
    editor = initEditor(store)
    hotkeyManager = new HotkeyManager(editor)
  })

  it('deregisters key event listener', () => {
    const listener = jest.fn()
    hotkeyManager.$on({ key: 'a' }, listener)
    expect(hotkeyManager.listeners.length).toEqual(1)
    hotkeyManager.$off({ key: 'a' }, listener)
    expect(hotkeyManager.listeners.length).toEqual(0)
  })
})

describe('registerTabBehavior', () => {
  beforeEach(() => {
    store = createTestStore()
    editor = initEditor(store)
    hotkeyManager = new HotkeyManager(editor)
    hotkeyManager.registerTabBehavior()
  })

  it('registers Tab to select next annotation', () => {
    const annotation = buildAnnotation(editor)
    jest.spyOn(editor, 'selectNextAnnotation').mockReturnValue(annotation)
    jest.spyOn(editor, 'zoomToAnnotation').mockReturnValue(undefined)

    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Tab' }))
    expect(editor.selectNextAnnotation).toBeCalled()
    expect(editor.zoomToAnnotation).toBeCalledWith(annotation)
  })

  it('when window level is active, never trigger action for Tab', () => {
    const annotation = buildAnnotation(editor)
    jest.spyOn(editor, 'selectNextAnnotation').mockReturnValue(annotation)
    jest.spyOn(editor, 'zoomToAnnotation').mockReturnValue(undefined)
    jest.spyOn(editor.pluginManager, 'isWindowLevelPluginActive', 'get').mockReturnValue(true)

    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Tab' }))
    expect(editor.selectNextAnnotation).not.toBeCalled()
    expect(editor.zoomToAnnotation).not.toBeCalledWith(annotation)
  })

  it('registers Shift + Tab to select previous annotation', () => {
    const annotation = buildAnnotation(editor)
    jest.spyOn(editor, 'selectPreviousAnnotation').mockReturnValue(annotation)
    jest.spyOn(editor, 'zoomToAnnotation').mockReturnValue(undefined)

    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Tab', shiftKey: true }))
    expect(editor.selectPreviousAnnotation).toBeCalled()
    expect(editor.zoomToAnnotation).toBeCalledWith(annotation)
  })
})

describe('handleTagAnnotationClass', () => {
  let tagAnnotation: Annotation
  let tagAnnotationClass: AnnotationClass
  let nonTagAnnotation: Annotation
  let nonTagAnnotationClass: AnnotationClass
  let v7: TeamPayload
  let user: UserPayload
  let membership: MembershipPayload

  beforeEach(() => {
    tagAnnotationClass = new AnnotationClass(tag)
    nonTagAnnotationClass = new AnnotationClass(flask)

    const annotationClasses = [tagAnnotationClass, nonTagAnnotationClass]

    store = createTestStore()
    v7 = buildTeamPayload({ id: 1 })
    user = buildUserPayload({ id: 2 })
    membership = buildMembershipPayload({ id: 3, user_id: user.id })

    store.commit('team/SET_CURRENT_TEAM', v7)
    store.commit('team/SET_MEMBERSHIPS', [membership])
    store.commit('user/SET_PROFILE', user)
    editor = initEditor(store)
    editor.activeView.annotationClasses = annotationClasses

    tagAnnotation = buildAnnotation(editor, { classId: tag.id })!
    nonTagAnnotation = buildAnnotation(editor, { classId: flask.id })!
    hotkeyManager = new HotkeyManager(editor)

    jest.spyOn(editor.actionManager, 'do').mockResolvedValue(undefined)
  })

  describe('when annotating an image', () => {
    beforeEach(() => {
      jest.spyOn(editor, 'loadedVideo', 'get').mockReturnValue(null)
    })

    it('adds a new annotation when there is no existing tag', () => {
      jest.spyOn(editor, 'initializeAnnotation').mockReturnValue(tagAnnotation)
      jest.spyOn(editor.activeView, 'annotations', 'get').mockReturnValue([nonTagAnnotation])

      hotkeyManager.handleTagAnnotationClass(tagAnnotationClass)
      expect(editor.initializeAnnotation).toBeCalledWith({
        type: 'tag',
        actors: [{
          role: 'annotator',
          user_id: user.id
        }],
        classId: tagAnnotationClass.id,
        data: { tag: { } }
      })
      expect(editor.actionManager.do).toBeCalled()
    })

    it('adds a new annotation when there is an existing tag', () => {
      jest.spyOn(editor.activeView, 'removeAnnotation').mockReturnValue(Promise.resolve(undefined))
      jest.spyOn(editor.activeView, 'annotations', 'get').mockReturnValue([tagAnnotation])

      hotkeyManager.handleTagAnnotationClass(tagAnnotationClass)
      expect(editor.activeView.removeAnnotation).toBeCalledWith(tagAnnotation)
    })
  })

  describe('when annotating a video', () => {
    beforeEach(() => {
      jest.spyOn(editor.activeView, 'loadedVideo', 'get').mockReturnValue({
        id: 1,
        fps: 5,
        currentFrameIndex: 1,
        frames: { 1: buildLoadedFrame() }
      })
    })

    it('adds a new annotation when there is no existing tag', () => {
      jest.spyOn(editor, 'initializeAnnotation').mockReturnValue(tagAnnotation)
      jest.spyOn(editor.activeView, 'annotations', 'get').mockReturnValue([nonTagAnnotation])

      hotkeyManager.handleTagAnnotationClass(tagAnnotationClass)
      expect(editor.initializeAnnotation).toBeCalledWith({
        type: 'tag',
        actors: [{
          role: 'annotator',
          user_id: user.id
        }],
        classId: tagAnnotationClass.id,
        data: {
          frames: { 1: { tag: { }, keyframe: true } },
          segments: [[1, 1]],
          interpolated: false
        }
      })
      expect(editor.actionManager.do).toBeCalled()
    })

    it('adds a new annotation when there is an existing tag', () => {
      jest.spyOn(editor.activeView, 'removeAnnotation').mockResolvedValue(undefined)
      jest.spyOn(editor.activeView, 'annotations', 'get').mockReturnValue([tagAnnotation])

      hotkeyManager.handleTagAnnotationClass(tagAnnotationClass)
      expect(editor.activeView.removeAnnotation).toBeCalledWith(tagAnnotation)
    })
  })
})
