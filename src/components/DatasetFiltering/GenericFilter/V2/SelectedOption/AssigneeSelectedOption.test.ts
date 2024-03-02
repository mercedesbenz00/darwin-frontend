import { createLocalVue, shallowMount } from '@vue/test-utils'

import { assigneeOption } from 'test/unit/fixtures/generic-filter-options'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'

import AssigneeSelectedOption from './AssigneeSelectedOption.vue'

const localVue = createLocalVue()
let propsData: { option: GenericFilterOptionType }

beforeEach(() => {
  propsData = {
    option: assigneeOption
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AssigneeSelectedOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
