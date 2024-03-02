import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildWorkflowTemplatePayload,
  buildDatasetPayload,
  buildWorkflowStageTemplatePayload
} from 'test/unit/factories'
import { initializeARTemplate } from 'test/unit/factories/helpers'

import Stages from '@/components/DatasetSettings/Stages.vue'
import { DatasetPayload, StageType, WorkflowTemplatePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const model = {
  annotateStage: 'annotate-stage-stub',
  draggableContainer: 'animating-draggable-stub',
  newStage: 'new-stage-stub',
  reviewStage: 'review-stage-stub',
  blindStage: 'blind-stage-stub',
  modelStage: 'model-stage-stub',
  codeStage: 'code-stage-stub'
}

let store: ReturnType<typeof createTestStore>

let propsData: {
  dataset: DatasetPayload,
  template: WorkflowTemplatePayload
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    dataset: buildDatasetPayload({}),
    template: initializeARTemplate()
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(Stages, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('enables sampling rates on all but the last stage', () => {
  const wrapper = shallowMount(Stages, { localVue, propsData, store })
  expect(wrapper.find(model.annotateStage).props('hasSampling')).toBe(true)
  expect(wrapper.find(model.reviewStage).props('hasSampling')).toBe(false)
})

it('emits create when stage is created', async () => {
  const wrapper = shallowMount(Stages, { localVue, propsData, store })

  const newStage = buildWorkflowStageTemplatePayload({ id: 2 })
  await wrapper.find(model.newStage).vm.$emit('create', newStage)

  expect(wrapper.emitted().create).toHaveLength(1)
})

it('emits change when stage is updated', async () => {
  const wrapper = shallowMount(Stages, { localVue, propsData, store })

  const stageTemplates = propsData.template.workflow_stage_templates
  await wrapper.find(model.annotateStage).vm.$emit('change', stageTemplates[0])

  expect(wrapper.emitted().change).toHaveLength(1)
})

it('emits delete when stage is deleted', async () => {
  const wrapper = shallowMount(Stages, { localVue, propsData, store })

  const stageTemplates = propsData.template.workflow_stage_templates
  await wrapper.find(model.annotateStage).vm.$emit('delete')

  expect(wrapper.emitted().delete![0]).toEqual([[stageTemplates[0]]])
})

it('emits swap when stages are swapped', async () => {
  propsData.template = buildWorkflowTemplatePayload({
    workflow_stage_templates: [
      buildWorkflowStageTemplatePayload({ id: 1, type: StageType.Annotate, stage_number: 1 }),
      buildWorkflowStageTemplatePayload({ id: 2, type: StageType.Review, stage_number: 2 }),
      buildWorkflowStageTemplatePayload({ id: 3, type: StageType.Annotate, stage_number: 3 }),
      buildWorkflowStageTemplatePayload({ id: 4, type: StageType.Complete, stage_number: 4 })
    ]
  })
  const wrapper = shallowMount(Stages, { localVue, propsData, store })

  await wrapper
    .find(model.draggableContainer)
    .vm.$emit('change', { moved: { oldIndex: 0, newIndex: 1 } })

  expect(wrapper.emitted().swap).toEqual([[{ oldIndex: 0, newIndex: 1 }]])
})
