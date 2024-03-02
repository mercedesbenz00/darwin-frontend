import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildAnnotation, buildDatasetPayload } from 'test/unit/factories'

import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { getMeasureOverlayColorFromAnnotation } from '@/engine/utils'

let store: ReturnType<typeof createTestStore>
let editor: Editor

const localVue = createLocalVue()
localVue.use(Vuex)

const initEditor = (store: ReturnType<typeof createTestStore>) => {
  const editor = new Editor(new ItemManager(store), store)
  jest.spyOn(editor.camera, 'scaleToFit').mockReturnValue(undefined)
  const sfh = buildDatasetPayload({ id: 1 })
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(sfh, []))
  return editor
}

beforeEach(() => {
  store = createTestStore()
  editor = initEditor(store)
})

describe('getMeasureOverlayColorFromAnnotation', () => {
  it('returns color of an annotation class', () => {
    const annotation = buildAnnotation(editor)
    jest.spyOn(annotation!, 'annotationClass', 'get').mockReturnValue({
      color: { r: 0, g: 0, b: 0, a: 1 }
    } as any)
    expect(annotation).toBeDefined()
    expect(getMeasureOverlayColorFromAnnotation(annotation!)).toEqual('rgba(0,0,0,0.7)')
  })

  it('returns color of an annotation class', () => {
    const annotation = buildAnnotation(editor, { data: { label: 'Label' } })
    jest.spyOn(annotation!, 'annotationClass', 'get').mockReturnValue(undefined)
    expect(annotation).toBeDefined()
    expect(getMeasureOverlayColorFromAnnotation(annotation!)).toEqual('rgba(45,134,49,0.7)')
  })
})
