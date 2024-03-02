import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetPayload } from 'test/unit/factories'

import OpenDatasetDetailTabs from '@/components/Dataset/OpenDatasetDetail/OpenDatasetDetailTabs.vue'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

let propsData: { dataset: DatasetPayload }

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ team_slug: 'v7', slug: 'test_dataset' })
  }
})

it('matches snapshot when can update_dataset', () => {
  const wrapper = shallowMount(OpenDatasetDetailTabs, {
    localVue, propsData
  })
  expect(wrapper).toMatchSnapshot()
})
