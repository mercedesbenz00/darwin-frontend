import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildStageAnnotationPayload, buildWorkflowStagePayload } from 'test/unit/factories'
import { bottle } from 'test/unit/fixtures/annotation-class-payloads'

import VisibilityToggle from '@/components/WorkView/LayerBar/LayerBarItem/VisibilityToggle.vue'
import { StageAnnotation } from '@/store/modules/workview/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let annotation: StageAnnotation

let propsData: {
  annotation: StageAnnotation
}

beforeEach(() => {
  store = createTestStore()
  const stage = buildWorkflowStagePayload({ id: 1 })
  const payload = buildStageAnnotationPayload({
    annotation_class_id: bottle.id, workflow_stage_id: 1
  })

  store.commit('workview/SET_STAGE_ANNOTATIONS', { stage, annotations: [payload] })
  annotation = store.state.workview.stageAnnotations[0]
  propsData = { annotation }
})

it('matches snapshot when visible', () => {
  const wrapper = shallowMount(VisibilityToggle, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when invisible', () => {
  store.commit('workview/TOGGLE_ANNOTATION_VISIBILITY', annotation)
  const wrapper = shallowMount(VisibilityToggle, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('commits visibility toggle', () => {
  const wrapper = shallowMount(VisibilityToggle, { localVue, propsData, store })
  expect(annotation.isVisible).toBe(true)
  wrapper.find('button').trigger('click')
  expect(annotation.isVisible).toBe(false)
  wrapper.find('button').trigger('click')
  expect(annotation.isVisible).toBe(true)
})
