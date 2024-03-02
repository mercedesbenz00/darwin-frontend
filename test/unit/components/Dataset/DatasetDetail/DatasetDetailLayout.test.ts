import { createLocalVue, shallowMount } from '@vue/test-utils'
import { Location } from 'vue-router'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  dataset: DatasetPayload,
  parentType?: string,
  parentLocation?: string | Location,
  titleEditable?: boolean
}

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
  }
})

it('matches snapshot when title editable', () => {
  propsData.titleEditable = true
  const wrapper = shallowMount(DatasetDetailLayout, {
    localVue, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when title not editable', () => {
  propsData.titleEditable = false
  const wrapper = shallowMount(DatasetDetailLayout, {
    localVue, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "dataset"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/dataset'
  const wrapper = shallowMount(DatasetDetailLayout, {
    localVue, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "folder"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/folder'
  const wrapper = shallowMount(DatasetDetailLayout, {
    localVue, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('emits change-title when title edited', () => {
  propsData.titleEditable = true
  const wrapper = shallowMount(DatasetDetailLayout, {
    localVue, propsData
  })
  wrapper.find('dataset-title-stub').vm.$emit('change', 'new title')
  expect(wrapper.emitted()['change-title']).toEqual([['new title']])
})
