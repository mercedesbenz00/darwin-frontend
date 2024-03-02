import { Wrapper, createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildStageAnnotationPayload,
  buildWorkflowStagePayload,
  buildDatasetItemPayload
} from 'test/unit/factories'

import AnnotationOverlays from '@/components/WorkView/AnnotationOverlay/AnnotationOverlays.vue'
import { Editor } from '@/engine/editor'
import { ItemManager } from '@/engine/managers'
import { View } from '@/engine/models'
import { DatasetItemStatus, StageType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let mocks: { $theme: ReturnType<typeof createMockTheme> }
let propsData: { view: View }
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  const dataset = buildDatasetPayload({ id: 999 })

  const annotationClass = buildAnnotationClassPayload({
    id: 1,
    team_id: dataset.team_id,
    datasets: [{ id: dataset.id }],
    name: 'attributes',
    metadata: {
      _color: 'rgba(255, 0, 0, 1)'
    },
    annotation_types: ['polygon', 'attributes'],
    description: 'attributes'
  })

  const stage = buildWorkflowStagePayload({ id: 1 })

  const annotation = buildStageAnnotationPayload({
    annotation_class_id: annotationClass.id,
    workflow_stage_id: 1,
    data: {
      polygon: {
        path: [
          { x: 1, y: 1 },
          { x: 5, y: 1 },
          { x: 5, y: 5 }
        ]
      }
    },
    z_index: 1
  })

  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('aclass/SET_CLASSES', [annotationClass])
  store.commit('workview/SET_DATASET', dataset)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [annotation] })

  mocks = { $theme: createMockTheme() }

  const editor = new Editor(new ItemManager(store), store)
  editor.installAllPlugins(editor.pluginManager.pluginsForDataset(dataset, []))
  editor.layout.updateViewsCameraDimensions(10, 10)
  editor.camera.setImage({ width: 10, height: 10 })
  editor.scaleToFit()
  editor.activeView.setAnnotationClasses(store.state.aclass.classes)
  editor.activeView.annotationManager.setAnnotations(
    store.getters['workview/sortedAnnotationsByStage'](stage)
  )

  propsData = { view: editor.viewsList[0] }
})

it('matches snapshot when subannotations are visible', () => {
  const wrapper = shallowMount(AnnotationOverlays, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when subannotations are invisible', () => {
  store.commit('workview/TOGGLE_SUBANNOTATIONS')
  const wrapper = shallowMount(AnnotationOverlays, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('should return empty object for type thresholds, when current stage is the first stage', () => {
  const item = buildDatasetItemPayload({
    id: 1,
    current_workflow_id: 1,
    current_workflow: {
      current_stage_number: 1,
      current_workflow_stage_template_id: 1,
      workflow_template_id: 1,
      status: DatasetItemStatus.complete,
      id: 1,
      dataset_item_id: 1,
      stages: {
        1: [buildWorkflowStagePayload({ type: StageType.Review })],
        2: [buildWorkflowStagePayload({ type: StageType.Complete })]
      }
    }
  })
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', item.current_workflow!.stages[1][0])
  const wrapper: Wrapper<Vue> = shallowMount(AnnotationOverlays, { localVue, mocks, propsData, store })
  expect((wrapper.vm as any).typeThresholds).toEqual({})
})
