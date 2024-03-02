import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildWorkflowTemplatePayload,
  buildReviewStageTemplatePayload,
  buildAnnotateStageTemplatePayload,
  buildModelStageTemplatePayload,
  buildCompleteStageTemplatePayload
} from 'test/unit/factories'

import TemplateEditor from '@/components/DatasetSettings/TemplateEditor.vue'
import {
  AnnotateStageTemplatePayload,
  CompleteStageTemplatePayload,
  DatasetPayload,
  ModelStageTemplatePayload,
  ReviewStageTemplatePayload,
  StageType,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload
} from '@/store/types'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
localVue.directive('loading', () => {})

let dataset: DatasetPayload
let template: WorkflowTemplatePayload
let annotatorStageTemplate: AnnotateStageTemplatePayload
let reviewStageTemplate: ReviewStageTemplatePayload
let modelStageTemplate: ModelStageTemplatePayload
let completeStageTemplate: CompleteStageTemplatePayload
let store: ReturnType<typeof createTestStore>
const stubs: Stubs = ['stages']

beforeEach(() => {
  dataset = buildDatasetPayload({ id: 1 })
  store = createTestStore()

  annotatorStageTemplate = buildAnnotateStageTemplatePayload({
    id: 1,
    name: 'Annotate',
    stage_number: 1,
    workflow_stage_template_assignees: [
      { assignee_id: 1, sampling_rate: 1 },
      { assignee_id: 2, sampling_rate: 1 }
    ]
  })

  reviewStageTemplate = buildReviewStageTemplatePayload({
    id: 2,
    name: 'Review',
    stage_number: 2
  })

  modelStageTemplate = buildModelStageTemplatePayload({
    id: 3,
    stage_number: 3,
    metadata: {
      class_mapping: [
        { annotation_class_id: 1, model_class_label: 'foo' },
        { annotation_class_id: 2, model_class_label: 'bar' }
      ]
    }
  })

  completeStageTemplate = buildCompleteStageTemplatePayload({ id: 4, stage_number: 4 })

  template = buildWorkflowTemplatePayload({
    dataset_id: dataset.id,
    // Intentionally out of order, to make sure the component sorts correctly
    workflow_stage_templates: [
      reviewStageTemplate,
      annotatorStageTemplate,
      modelStageTemplate,
      completeStageTemplate
    ]
  })
  store.commit('dataset/PUSH_WORKFLOW_TEMPLATE', template)
})

it('matches snapshot', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('loads workflow templates when dataset is version 1', async () => {
  const propsData = { dataset }
  shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()

  expect(store.dispatch).toBeCalledWith(
    'dataset/loadWorkflowTemplates',
    expect.objectContaining({ id: dataset.id })
  )
})

it('does not load workflow templates when dataset is not version 1', async () => {
  const propsData = { dataset }
  propsData.dataset.version = 2
  shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()

  expect(store.dispatch).not.toBeCalledWith(
    'dataset/loadWorkflowTemplates',
    expect.objectContaining({ id: dataset.id })
  )
})

it('emits change when the stage is created', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()

  wrapper.find('stages-stub').vm.$emit('create', StageType.Annotate)
  expect(wrapper.emitted().change).toHaveLength(1)
})

it('emits change when the stage is updated', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()

  const newStage: AnnotateStageTemplatePayload = {
    ...annotatorStageTemplate,
    ...{ metadata: { ...annotatorStageTemplate.metadata, assignable_to: 'anyone' } }
  }
  wrapper.find('stages-stub').vm.$emit('change', newStage)
  expect(wrapper.emitted().change).toHaveLength(1)
})

it('converts annotate stage to blind stage and back', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
  await flushPromises()

  const updated: AnnotateStageTemplatePayload = {
    ...annotatorStageTemplate,
    ...{ metadata: { ...annotatorStageTemplate.metadata, parallel: 2 } }
  }

  // assert initial stages are good

  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.type)
  ).toEqual(['annotate', 'review', 'model', 'complete'])
  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.stage_number)
  ).toEqual([1, 2, 3, 4])

  wrapper.find('stages-stub').vm.$emit('change', updated)

  // assert the first annotate stage was replaced with annotate, test, review
  // and stage numbers were correctly updated

  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.type)
  ).toEqual(['annotate', 'test', 'review', 'review', 'model', 'complete'])

  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.stage_number)
  ).toEqual([1, 2, 3, 4, 5, 6])

  wrapper.find('stages-stub').vm.$emit('change', annotatorStageTemplate)

  // assert we're back to where we were at the start

  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.type)
  ).toEqual(['annotate', 'review', 'model', 'complete'])
  expect(
    wrapper.vm.$data.editingWorkflowTemplate.workflow_stage_templates
      .map((t: WorkflowStageTemplatePayload) => t.stage_number)
  ).toEqual([1, 2, 3, 4])
})

it('emits change when the stage delete is confirmed', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })

  await flushPromises()

  wrapper.find('stages-stub').vm.$emit('delete', [reviewStageTemplate])
  wrapper.find('delete-confirmation-dialog-stub').vm.$emit('confirmed')
  expect(wrapper.emitted().change).toHaveLength(1)
})

it('emits change when the stages are swaped', async () => {
  const propsData = { dataset }
  const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })

  await flushPromises()

  await wrapper.find('stages-stub').vm.$emit('swap', { oldIndex: 0, newIndex: 1 })
  expect(wrapper.emitted().change).toHaveLength(1)
})

describe('saveWorkflowTemplate', () => {
  it('dispatches stage template update when name is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: AnnotateStageTemplatePayload = { ...annotatorStageTemplate, name: 'new name' }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ name: 'new name' })
    )
  })

  it('dispatches stage template update when assignable_to is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      ...{ metadata: { ...annotatorStageTemplate.metadata, assignable_to: 'any_user' } }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when readonly is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const { metadata } = reviewStageTemplate
    const newStage: ReviewStageTemplatePayload = {
      ...reviewStageTemplate,
      metadata: { ...metadata, readonly: true }
    }

    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when base_sampling_rate is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      ...{ metadata: { ...annotatorStageTemplate.metadata, base_sampling_rate: 0.1 } }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when user_sampling_rate is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      ...{ metadata: { ...annotatorStageTemplate.metadata, user_sampling_rate: 0.1 } }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when running_session_id is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: ModelStageTemplatePayload = {
      ...modelStageTemplate,
      ...{ metadata: { ...modelStageTemplate.metadata, running_session_id: 'foo' } }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when running_session_id is changed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: ModelStageTemplatePayload = {
      ...modelStageTemplate,
      ...{ metadata: { ...modelStageTemplate.metadata, auto_instantiate: true } }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update when assignees are added', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const dispatch = (store.dispatch as jest.Mock)
    dispatch.mockClear()

    const newStage: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      metadata: { ...annotatorStageTemplate.metadata },
      workflow_stage_template_assignees: [
        { assignee_id: 1, sampling_rate: 1 },
        { assignee_id: 2, sampling_rate: 1 },
        { assignee_id: 3, sampling_rate: 1 }
      ]
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    await component.saveWorkflowTemplate()
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({
        assignees: [
          { id: 1, samplingRate: 1 },
          { id: 2, samplingRate: 1 },
          { id: 3, samplingRate: 1 }
        ]
      })
    )
  })

  it('dispatches stage template update when assignes are removed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      metadata: { ...annotatorStageTemplate.metadata },
      workflow_stage_template_assignees: [{ assignee_id: 1, sampling_rate: 1 }]

    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    const component = wrapper.vm as any
    await component.saveWorkflowTemplate()
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({
        assignees: [{ id: 1, samplingRate: 1 }]
      })
    )
  })

  it('dispatches stage template update when class mapping changes', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage: ModelStageTemplatePayload = {
      ...modelStageTemplate,
      metadata: {
        ...modelStageTemplate.metadata,
        class_mapping: [
          modelStageTemplate.metadata.class_mapping![0],
          { ...modelStageTemplate.metadata.class_mapping![1], annotation_class_id: 5 }
        ]
      }
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage)

    await (wrapper.vm as any).saveWorkflowTemplate()
    expect(store.dispatch).toHaveBeenCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ stageId: newStage.id, metadata: newStage.metadata })
    )
  })

  it('dispatches stage template update twice when two stages are updated', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    const newStage1: AnnotateStageTemplatePayload = {
      ...annotatorStageTemplate,
      metadata: { ...annotatorStageTemplate.metadata },
      workflow_stage_template_assignees: [{ assignee_id: 1, sampling_rate: 1 }]
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage1)

    const newStage2: ReviewStageTemplatePayload = {
      ...reviewStageTemplate,
      metadata: { ...reviewStageTemplate.metadata },
      workflow_stage_template_assignees: [
        { assignee_id: 2, sampling_rate: 1 },
        { assignee_id: 3, sampling_rate: 1 }
      ]
    }
    wrapper.find('stages-stub').vm.$emit('change', newStage2)

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ stageId: newStage1.id })
    )
    expect(store.dispatch).toBeCalledWith(
      'dataset/updateWorkflowStageTemplate',
      expect.objectContaining({ stageId: newStage2.id })
    )
  })

  it('dispatches creation of new workflow when a new stage is added', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    await wrapper.find('stages-stub').vm.$emit('create', StageType.Annotate)

    const { name, ...expectedData } = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      workflow_stage_templates: [
        annotatorStageTemplate,
        reviewStageTemplate,
        modelStageTemplate,
        expect.objectContaining({ stage_number: 4, type: StageType.Annotate }),
        { ...completeStageTemplate, stage_number: 5 }
      ]
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: expectedData })

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()

    expect(store.dispatch).toBeCalledWith('dataset/createWorkflowTemplate', expectedData)
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('dataset/setDefaultWorkflowTemplate', expectedData)
  })

  it('dispatches creation of workflow when adding a blind stage set', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    await wrapper.find('stages-stub').vm.$emit('create', StageType.Test)

    const { name, ...expectedData } = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      workflow_stage_templates: [
        annotatorStageTemplate,
        reviewStageTemplate,
        modelStageTemplate,
        expect.objectContaining({ stage_number: 4, type: StageType.Annotate }),
        expect.objectContaining({ stage_number: 5, type: StageType.Test }),
        expect.objectContaining({ stage_number: 6, type: StageType.Review }),
        { ...completeStageTemplate, stage_number: 7 }
      ]
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: expectedData })

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()

    expect(store.dispatch).toBeCalledWith('dataset/createWorkflowTemplate', expectedData)
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('dataset/setDefaultWorkflowTemplate', expectedData)
  })

  it('dispatches creation of new workflow when an existing stage is removed', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    await wrapper.find('stages-stub').vm.$emit('delete', [reviewStageTemplate])
    await wrapper.find('delete-confirmation-dialog-stub').vm.$emit('confirmed')

    const { name, ...expectedData } = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      workflow_stage_templates: [
        annotatorStageTemplate,
        { ...modelStageTemplate, stage_number: 2 },
        { ...completeStageTemplate, stage_number: 3 }
      ]
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: expectedData })

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()

    expect(store.dispatch).toBeCalledWith('dataset/createWorkflowTemplate', expectedData)
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('dataset/setDefaultWorkflowTemplate', expectedData)
  })

  it('dispatches creation of new workflow on stage swap', async () => {
    const propsData = { dataset }
    const wrapper = shallowMount(TemplateEditor, { localVue, propsData, store, stubs })
    await flushPromises()

    // Workflow IS ARMC. We are swapping to RAMC
    await wrapper.find('stages-stub').vm.$emit('swap', { oldIndex: 0, newIndex: 1 })

    const expectedData = buildWorkflowTemplatePayload({
      dataset_id: dataset.id,
      workflow_stage_templates: [
        { ...reviewStageTemplate, stage_number: 1 },
        { ...annotatorStageTemplate, stage_number: 2 },
        modelStageTemplate,
        completeStageTemplate
      ]
    })
    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: expectedData })

    const component = wrapper.vm as any
    component.saveWorkflowTemplate()

    const { name, ...params } = expectedData
    expect(store.dispatch).toBeCalledWith('dataset/createWorkflowTemplate', params)
    await flushPromises()
    expect(store.dispatch).toBeCalledWith('dataset/setDefaultWorkflowTemplate', expectedData)
  })
})
