import { createLocalVue, shallowMount } from '@vue/test-utils'

import { folderOption } from 'test/unit/fixtures/generic-filter-options'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'

import FolderSelectedOption from './FolderSelectedOption.vue'

const localVue = createLocalVue()
let propsData: { option: GenericFilterOptionType }

beforeEach(() => {
  propsData = {
    option: folderOption
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FolderSelectedOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
