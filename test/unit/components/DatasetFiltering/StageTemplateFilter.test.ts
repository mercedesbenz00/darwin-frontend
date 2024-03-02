import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'
import { initializeARTemplate } from 'test/unit/factories/helpers'

import StageTemplateFilter from '@/components/DatasetFiltering/StageTemplateFilter/StageTemplateFilter.vue'
import { WorkflowStageTemplatePayload, WorkflowTemplatePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  positiveStageTemplateIds: WorkflowStageTemplatePayload['id'][],
  negativeStageTemplateIds: WorkflowStageTemplatePayload['id'][],
  workflowTemplate: WorkflowTemplatePayload
}

const sfh = buildDatasetPayload({ id: 5, default_workflow_template_id: 9 })
const template = initializeARTemplate(sfh)
template.workflow_stage_templates[0].name = 'Custom name'
template.id = 9

beforeEach(() => {
  propsData = {
    positiveStageTemplateIds: [],
    negativeStageTemplateIds: [],
    workflowTemplate: template
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when positive selections', () => {
  propsData.positiveStageTemplateIds = [template.workflow_stage_templates[0].id]
  propsData.negativeStageTemplateIds = [template.workflow_stage_templates[1].id]
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('correctly renders positive/negative state', () => {
  propsData.positiveStageTemplateIds = [template.workflow_stage_templates[0].id]
  propsData.negativeStageTemplateIds = [template.workflow_stage_templates[1].id]
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData })
  expect(wrapper.findAll('.filter__option').at(0).classes())
    .toContain('filter__option--positive')
  expect(wrapper.findAll('.filter__option').at(1).classes())
    .toContain('filter__option--negative')
  expect(wrapper.findAll('.filter__option').at(2).classes())
    .not.toContain('filter__option--positive')
  expect(wrapper.findAll('.filter__option').at(2).classes())
    .not.toContain('filter__option--negative')
})

it('emits events on change', async () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData })
  const [annotate, review, complete] = template.workflow_stage_templates

  // Nothing selected, click on A
  await wrapper.findAll('status-button-stub').at(0).vm.$emit('click')
  // Toggles selection of A
  expect(wrapper.emitted().change![0]).toEqual([{
    positiveStageTemplateIds: [annotate.id],
    negativeStageTemplateIds: []
  }])

  // A and R selected
  await wrapper.setProps({ positiveStageTemplateIds: [annotate.id, review.id] })
  // Click on A
  await wrapper.findAll('status-button-stub').at(0).vm.$emit('click')
  // Toggles negative status of A
  expect(wrapper.emitted().change![1]).toEqual([{
    positiveStageTemplateIds: [review.id],
    negativeStageTemplateIds: [annotate.id]
  }])

  // A and R selected
  await wrapper.setProps({
    positiveStageTemplateIds: [annotate.id],
    negativeStageTemplateIds: [review.id]
  })
  // Click on C
  await wrapper.findAll('status-button-stub').at(2).vm.$emit('click')
  // Toggles selection of C
  expect(wrapper.emitted().change![2]).toEqual([{
    positiveStageTemplateIds: [annotate.id, complete.id],
    negativeStageTemplateIds: [review.id]
  }])
})

it('renders stage name or type as tooltip', () => {
  const wrapper = shallowMount(StageTemplateFilter, { localVue, propsData })
  expect(wrapper.findAll('.filter__option').at(0).attributes('tooltip'))
    .toEqual('Custom name')

  expect(wrapper.findAll('.filter__option').at(1).attributes('tooltip'))
    .toEqual('Review')

  expect(wrapper.findAll('.filter__option').at(2).attributes('tooltip'))
    .toEqual('Complete')
})
