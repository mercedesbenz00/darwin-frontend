import { createLocalVue, shallowMount } from '@vue/test-utils'

import { assigneeOption } from 'test/unit/fixtures/generic-filter-options'

import { AssigneeOption } from '@/components/DatasetFiltering/GenericFilter/Common'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'

const localVue = createLocalVue()
let propsData: { option: GenericFilterOptionType }

beforeEach(() => {
  propsData = {
    option: assigneeOption
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AssigneeOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
