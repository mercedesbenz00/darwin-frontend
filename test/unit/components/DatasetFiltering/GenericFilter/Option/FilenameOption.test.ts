import { createLocalVue, shallowMount } from '@vue/test-utils'

import {
  dicomFilenameOption,
  imageFilenameOption,
  pdfFilenameOption,
  videoFilenameOption
} from 'test/unit/fixtures/generic-filter-options'

import { FilenameOption } from '@/components/DatasetFiltering/GenericFilter/Common'
import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'

const localVue = createLocalVue()
let propsData: { option: GenericFilterOptionType }

it('when image filename option, matches snapshot', () => {
  propsData = {
    option: imageFilenameOption
  }
  const wrapper = shallowMount(FilenameOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('when image dicom option, matches snapshot', () => {
  propsData = {
    option: dicomFilenameOption
  }
  const wrapper = shallowMount(FilenameOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('when image pdf option, matches snapshot', () => {
  propsData = {
    option: pdfFilenameOption
  }
  const wrapper = shallowMount(FilenameOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('when image video option, matches snapshot', () => {
  propsData = {
    option: videoFilenameOption
  }
  const wrapper = shallowMount(FilenameOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
