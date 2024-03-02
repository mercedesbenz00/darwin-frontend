import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload, buildV2DARCWorkflow } from 'test/unit/factories'
import Model from 'test/unit/pageModels/Model'

import { StageType, V2DatasetStagePayload } from '@/store/types'

import StageFilter from './StageFilter.vue'

import { StageFilterProps } from '.'

const localVue = createLocalVue()

let propsData: StageFilterProps
localVue.directive('tooltip', stubDirectiveWithAttribute)

beforeEach(() => {
  const dataset = buildDatasetPayload({ id: 5 })
  const workflow = buildV2DARCWorkflow()
  const stage = workflow.stages.find(s => s.type === StageType.Dataset) as V2DatasetStagePayload
  stage.config.dataset_id = dataset.id

  propsData = {
    dataset,
    workflow,
    includedIds: [],
    excludedIds: []
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(StageFilter, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with selection active', async () => {
  const wrapper = shallowMount(StageFilter, { localVue, propsData })
  await wrapper.setProps({ includedIds: ['review'], excludedIds: ['discard'] })
  expect(wrapper).toMatchSnapshot()
})

class ComponentModel extends Model {
  get options (): string[] {
    return this.wrapper.findAll('.filter__option__icon').wrappers.map(w => w.attributes('type')!)
  }

  toggleOption (type: StageType): Vue {
    const options = this.wrapper.findAll('.filter__option__icon').wrappers
    const wrapper = options.find(w => w.attributes('type')! === type)
    if (!wrapper) { throw new Error('Selected option not found!') }
    return wrapper.vm.$emit('click')
  }
}

it('renders an option for every stage', () => {
  const wrapper = shallowMount(StageFilter, { localVue, propsData })
  const model = new ComponentModel(wrapper)
  expect(model.options).toEqual(['dataset', 'annotate', 'review', 'complete', 'discard'])
})

it('toggles options', async () => {
  const wrapper = shallowMount(StageFilter, { localVue, propsData })
  const model = new ComponentModel(wrapper)

  await model.toggleOption(StageType.Dataset)
  expect(wrapper.emitted().change![0][0]).toEqual({ excludedIds: [], includedIds: ['dataset'] })

  await wrapper.setProps({ includedIds: ['dataset'] })
  await model.toggleOption(StageType.Annotate)
  expect(wrapper.emitted().change![1][0]).toEqual({
    excludedIds: [],
    includedIds: ['dataset', 'annotate']
  })

  await wrapper.setProps({ includedIds: ['dataset', 'annotate'] })
  await model.toggleOption(StageType.Annotate)
  expect(wrapper.emitted().change![2][0]).toEqual({
    excludedIds: ['annotate'],
    includedIds: ['dataset']
  })
})
