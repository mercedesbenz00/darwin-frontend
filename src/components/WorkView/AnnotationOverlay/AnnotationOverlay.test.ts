import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotation,
  buildAnnotationClassPayload,
  buildStageAnnotationPayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import AnnotationOverlay from '@/components/WorkView/AnnotationOverlay/AnnotationOverlay.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View, AnnotationOverlayData } from '@/engine/models'
import { AnnotationType } from '@/engineCommon/AnnotationType'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

let propsData: AnnotationOverlayData & {
  error?: boolean
  view: View
  editable: boolean
}

let mocks: {
  $theme: ReturnType<typeof createMockTheme>
}
let editor: Editor

beforeEach(() => {
  store = createTestStore()

  setDefaultAnnotationTypes(store)

  store.commit('aclass/SET_CLASSES', [buildAnnotationClassPayload({
    id: 1,
    annotation_types: ['polygon', 'attributes']
  })])

  const item = initializeARWorkflow()
  const stage = item.current_workflow!.stages[1][0]

  const annotations = [
    buildStageAnnotationPayload({
      id: 'foo',
      annotation_class_id: 1,
      workflow_stage_id: stage.id,
      data: {
        polygon: {
          path: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]
        }
      }
    })
  ]

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations })

  editor = new Editor(new ItemManager(store), store)
  editor.installAllPlugins(editor.pluginManager.pluginsForView())
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  editor.activeView.annotationManager.setAnnotations(
    store.getters['workview/sortedAnnotationsByStage'](stage)
  )

  mocks = {
    $theme: createMockTheme()
  }

  const annotation = editor.activeView.annotations[0]
  jest.spyOn(editor.viewsList[0].annotationManager, 'annotations', 'get').mockReturnValue([
    annotation
  ])

  propsData = {
    id: 'foo',
    x: 0,
    y: 0,
    label: 'label',
    annotation: annotation,
    subAnnotationTypes: [
      new AnnotationType(store.state.aclass.types.find(t => t.name === 'attributes')!)
    ],
    overlays: [{ text: 'overlay' }],
    editable: true,
    view: editor.viewsList[0]
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', async () => {
  const wrapper = shallowMount(AnnotationOverlay, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
  await wrapper.find('div.pill').trigger('mouseover')
  expect(wrapper).toMatchSnapshot('hover')
})

itMatchesSnapshot()

describe('when disabled', () => {
  beforeEach(() => {
    store.commit('workview/SET_ANNOTATION_OVERLAY_DISABLED', true)
  })

  itMatchesSnapshot()
})

describe('when consensus error', () => {
  beforeEach(() => {
    propsData.error = true
  })

  itMatchesSnapshot()
})

it('with confidence', () => {
  const editor = new Editor(new ItemManager(store), store)
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  const annotation = buildAnnotation(editor, {
    data: {
      inference: {
        confidence: 0.5,
        model: {
          id: 'fake-model',
          name: 'Fake Model',
          type: 'instance_segmentation'
        }
      }
    }
  })!
  editor.activeView.annotationManager.annotationsMap[annotation.id] = annotation
  propsData = { ...propsData, annotation, view: editor.activeView }
  const wrapper = shallowMount(AnnotationOverlay, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
