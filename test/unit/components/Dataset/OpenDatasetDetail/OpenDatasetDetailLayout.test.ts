import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import OpenDatasetDetailLayout from '@/components/Dataset/OpenDatasetDetail/OpenDatasetDetailLayout.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: { dataset: DatasetPayload, parentType?: string, parentLocation?: string | Location }

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
  }
})

it('matches snapshot', () => {
  const mocks = { $route: { path: '/v7/sfh' } }
  const wrapper = shallowMount(OpenDatasetDetailLayout, {
    localVue, mocks, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "dataset"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/dataset'
  const mocks = { $route: { path: '/v7/sfh' } }
  const wrapper = shallowMount(OpenDatasetDetailLayout, {
    localVue, mocks, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when parentType is "folder"', () => {
  propsData.parentType = 'dataset'
  propsData.parentLocation = '/folder'
  const mocks = { $route: { path: '/v7/sfh' } }
  const wrapper = shallowMount(OpenDatasetDetailLayout, {
    localVue, mocks, propsData
  })
  expect(wrapper).toMatchSnapshot()
})
