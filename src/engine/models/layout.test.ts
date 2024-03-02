import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload
} from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { StreamView } from '@/engine/models'

import { Layout } from './layout'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let editor: Editor
let layout: Layout

const sfh = buildDatasetPayload({ id: 1 })

const initEditor = (store: ReturnType<typeof createTestStore>) => {
  const editor = new Editor(new ItemManager(store), store)
  document.body.appendChild(editor.viewsList[0].mainLayer.canvas)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('setViewConfig', () => {
  it('should not re-set the same item', async () => {
    const item = buildDatasetItemPayload()
    editor.layout.activeView.currentItem = item

    jest.spyOn(editor.layout.activeView, 'setItem')

    await editor.layout.setViewConfig(editor.layout.activeView.id, { item })

    expect(editor.layout.activeView.setItem).not.toHaveBeenCalled()
  })

  it('should trigger View.setItem only for the same item constructor', async () => {
    const item = buildDatasetItemPayload()
    const newItem = buildDatasetItemPayload({ id: 4 })
    editor.layout.activeView.currentItem = item

    jest.spyOn(editor.layout.activeView, 'setItem')

    await editor.layout.setViewConfig(
      editor.layout.activeView.id,
      { item: newItem }
    )

    expect(editor.layout.activeView.setItem).toHaveBeenCalled()
  })

  it('should re-generate view using item type related constructor', async () => {
    store.commit('features/SET_FEATURES', [{ name: 'VIDEO_STREAM', enabled: true }])

    const item = buildDatasetItemPayload()
    const newItem = buildDatasetItemPayload({
      id: 5,
      dataset_video: buildDatasetVideoPayload({
        streamable: true
      })
    })
    editor.layout.activeView.currentItem = item

    jest.spyOn(StreamView.prototype, 'setItem')

    await editor.layout.setViewConfig(editor.layout.activeView.id, { item: newItem })

    expect(editor.layout.activeView.constructor).toBe(StreamView)
  })
})

describe('multiple views', () => {
  beforeEach(() => {
    editor = new Editor(new ItemManager(store), store)
    editor.setupLayout({
      type: 'horizontal',
      views: [{
        item: null,
        framesGroup: [0]
      }, {
        item: null,
        framesGroup: [1]
      }]
    })
    editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
    layout = editor.layout
  })

  describe('setActiveView', () => {
    it('should change active view', () => {
      expect(layout.activeView).toBe(layout.viewsList[0])
      layout.setActiveView(layout.viewsList[1])
      expect(layout.activeView).toBe(layout.viewsList[1])
    })

    it('should remove listeners for previous view', () => {
      // @ts-ignore
      const spyRemoveListeners = jest.spyOn(layout.viewsList[0], 'removeListeners')

      layout.setActiveView(layout.viewsList[1])

      expect(spyRemoveListeners).toHaveBeenCalled()
    })

    it('should register listeners for target view', () => {
      // @ts-ignore
      const spyAddListeners = jest.spyOn(layout.viewsList[1], 'addListeners')

      layout.setActiveView(layout.viewsList[1])

      expect(spyAddListeners).toHaveBeenCalled()
    })
  })
})
