import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetPayload } from 'test/unit/factories'

import DatasetDetailTabs from '@/components/Dataset/DatasetDetail/DatasetDetailTabs.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: { dataset: DatasetPayload }

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
  }
})

it('matches snapshot when can update_dataset', () => {
  const mocks = {
    $can: jest.fn().mockReturnValue(true)
  }
  const wrapper = shallowMount(DatasetDetailTabs, {
    localVue, mocks, propsData
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when cannot update_dataset', () => {
  const mocks = {
    $can: jest.fn().mockReturnValue(true)
  }
  const wrapper = shallowMount(DatasetDetailTabs, {
    localVue, mocks, propsData
  })
  expect(wrapper).toMatchSnapshot()
})
