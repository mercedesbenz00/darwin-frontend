import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createEditorV2 } from 'test/unit/createEditorV2'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import { Editor } from '@/engineV2/editor'
import { AnnotationManager } from '@/engineV2/managers'
import { View } from '@/engineV2/views/view'

import VideoAnnotationsKeyframeButton from './VideoAnnotationsKeyframeButton.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>
let editor: Editor
let propsData: { editor: Editor }
let view: View

const sfh = buildDatasetPayload({ id: 1 })
const flask = buildAnnotationClassPayload({
  id: 1,
  name: 'flask',
  annotation_types: ['polygon'],
  datasets: [{ id: sfh.id }]
})

jest.mock('@/engineV2/views/view', () => {
  return {
    View: jest.fn().mockImplementation(() => {
      return {
        addListeners: jest.fn
      }
    })
  }
})

beforeEach(() => {
  store = createTestStore()
  store.commit('aclass/SET_CLASSES', [flask])
  store.commit('workview/SET_DATASET', sfh)

  editor = createEditorV2(store)
  // @ts-ignore -> Mock view object, don't need to pass in props.
  view = new View(editor)
  view.annotationManager = new AnnotationManager(view)
  jest.spyOn(view, 'addListeners').mockReturnValue(undefined)
  editor.layout.setActiveView(view)

  view.editor = editor
  propsData = { editor }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoAnnotationsKeyframeButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
