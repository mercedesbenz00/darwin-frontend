import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildAnnotationClassPayload, buildStageAnnotationPayload, buildWorkflowStagePayload } from 'test/unit/factories'

import HideByClass
  from '@/components/WorkView/LayerBar/AnnotationControl/HideByClass/HideByClass.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let class1: AnnotationClassPayload
let class2: AnnotationClassPayload

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  class1 = buildAnnotationClassPayload({ id: 1, annotation_types: ['polygon'] })
  class2 = buildAnnotationClassPayload({ id: 2, annotation_types: ['polygon'] })

  // control. component deals with non-tag classes
  const class3 = buildAnnotationClassPayload({ id: 3, annotation_types: ['tag'] })

  store.commit('aclass/SET_CLASSES', [class1, class2, class3])
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(HideByClass, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('with no classes,', () => {
  itMatchesSnapshot()
})

describe('with classes, with selected classes', () => {
  beforeEach(() => {
    const stage = buildWorkflowStagePayload({ id: 1 })
    store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
    store.commit('workview/SET_STAGE_ANNOTATIONS', {
      stage,
      annotations: [
        buildStageAnnotationPayload({ annotation_class_id: class1.id, workflow_stage_id: 1 }),
        buildStageAnnotationPayload({ annotation_class_id: class2.id, workflow_stage_id: 1 }),
        buildStageAnnotationPayload({ annotation_class_id: class2.id, workflow_stage_id: 1 })
      ]
    })

    store.commit('workview/HIDE_ANNOTATIONS_BY_CLASS', class1.id)
  })

  itMatchesSnapshot()

  it('updates annotations visibility by class', async () => {
    const wrapper = shallowMount(HideByClass, { localVue, store })
    await wrapper.findAll('hide-by-class-item-stub').at(0).vm.$emit('click')
    expect(store.dispatch)
      .toBeCalledWith('workview/toggleAnnotationsVisibilityByClass', class1.id)
  })
})
