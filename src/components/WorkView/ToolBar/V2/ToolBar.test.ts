import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Ref, ref } from 'vue'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import ToolBar from '@/components/WorkView/ToolBar/V2/ToolBar.vue'
import { Camera } from '@/engineCommon/camera'
import { Editor } from '@/engineV2/editor'
import { ILayer } from '@/engineV2/models'
import { Layer } from '@/engineV2/models/layers'
import { View } from '@/engineV2/views/view'

const localVue = createLocalVue()

localVue.prototype.$ga = { event () { } }

localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let provide: { editorV2: Ref<Editor> }
let propsData: { editor: Editor }
let mocks: {
  $theme: ReturnType<typeof createMockTheme>
}
let view: View
let layer: ILayer

const imageWidth: number = 64
const imageHeight: number = 64
const clientWidth: number = 500
const clientHeight: number = 300

const mockCamera = new Camera()

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        camera: mockCamera,
        addListeners: jest.fn
      }
    })
  }
})
// Mock the files that extend view so this test compiles.
jest.mock('@/engineV2/views/ImageView')

const initEditor = (store: ReturnType<typeof createTestStore>): Ref =>
  ref<Editor>(createEditorV2(store))

beforeEach(() => {
  store = createTestStore()
  const editor = createEditorV2(store)

  // @ts-ignore -> Mock view object, don't need to pass in props.
  view = new View()
  layer = new Layer(view.camera)
  jest.spyOn(view, 'addListeners').mockReturnValue(undefined)

  // Set the width and height of the layer canvas
  layer.canvas.width = clientHeight
  layer.canvas.height = clientWidth

  // Set a width and height for the camera different to the image.
  view.camera.setHeight(clientHeight)
  view.camera.setWidth(clientWidth)
  // Set the image height
  view.camera.setImage({width: imageWidth, height: imageHeight})
  editor.layout.setActiveView(view)

  view.editor = editor

  provide = { editorV2: initEditor(store) }
  propsData = { editor }
  mocks = {
    $theme: createMockTheme()
  }
})

describe('darwin toolbar', () => {
  beforeEach(() => { mocks.$theme = createMockTheme() })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ToolBar, { localVue, mocks, propsData, store, provide })
    expect(wrapper).toMatchSnapshot()
  })

  it('scale to fit when you click on scale button', () => {
    const wrapper = shallowMount(ToolBar, { localVue, mocks, propsData, store, provide })
    propsData.editor.activeView.scaleToFit = jest.fn()
    const component = wrapper.find('tool-bar-zoom-controls-stub')
    component.vm.$emit('scale-to-fit')
    expect(component.exists()).toBe(true)
    expect(propsData.editor.activeView.scaleToFit).toBeCalled()
  })

})
