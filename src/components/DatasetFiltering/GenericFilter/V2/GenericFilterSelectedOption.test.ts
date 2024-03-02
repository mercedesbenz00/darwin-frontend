import { createLocalVue, shallowMount } from '@vue/test-utils'

import {
  assigneeOption,
  imageFilenameOption,
  folderOption
} from 'test/unit/fixtures/generic-filter-options'

import { GenericFilterOptionType } from '@/components/DatasetFiltering/GenericFilter/types'
import { TriToggleStatus } from '@/utils'

import GenericFilterSelectedOption from './GenericFilterSelectedOption.vue'

const localVue = createLocalVue()
let propsData: {
  option: GenericFilterOptionType
  status: TriToggleStatus
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(GenericFilterSelectedOption, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const itEmitsDeselect = () => it('emits deselect', async () => {
  const wrapper = shallowMount(GenericFilterSelectedOption, { localVue, propsData })
  await wrapper.find('.generic-filter-selected-option__remove').trigger('click')
  expect(wrapper.emitted().deselect).toEqual([[propsData.option]])
})

describe('assignee option', () => {
  beforeEach(() => {
    propsData = { option: assigneeOption, status: 'positive' }
  })

  describe('positive', () => {
    beforeEach(() => {
      propsData.status = 'positive'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })

  describe('negative', () => {
    beforeEach(() => {
      propsData.status = 'negative'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })
})

describe('filename option', () => {
  beforeEach(() => {
    propsData = { option: imageFilenameOption, status: 'positive' }
  })

  describe('positive', () => {
    beforeEach(() => {
      propsData.status = 'positive'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })

  describe('negative', () => {
    beforeEach(() => {
      propsData.status = 'negative'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })
})

describe('folder option', () => {
  beforeEach(() => {
    propsData = { option: folderOption, status: 'positive' }
  })

  describe('positive', () => {
    beforeEach(() => {
      propsData.status = 'positive'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })

  describe('negative', () => {
    beforeEach(() => {
      propsData.status = 'negative'
    })

    itMatchesSnapshot()
    itEmitsDeselect()
  })
})
