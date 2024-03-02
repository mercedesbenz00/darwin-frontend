import { createLocalVue, shallowMount } from '@vue/test-utils'
import Router from 'vue-router'

import { buildDatasetPayload } from 'test/unit/factories'

import V2DatasetDetailTabs from '@/components/Dataset/DatasetDetail/V2DatasetDetailTabs.vue'
import type { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

localVue.use(Router)
const router = new Router()

let propsData: { dataset: DatasetPayload }

beforeEach(() => {
  propsData = {
    dataset: buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH' })
  }
})

it('matches snapshot when can update_dataset', () => {
  const mocks = {
    $can: jest.fn().mockReturnValue(true),
  }
  const wrapper = shallowMount(V2DatasetDetailTabs, {
    localVue,
    mocks,
    propsData,
    router
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when cannot update_dataset', () => {
  const mocks = {
    $can: jest.fn().mockReturnValue(true),
  }
  const wrapper = shallowMount(V2DatasetDetailTabs, {
    localVue,
    mocks,
    propsData,
    router
  })
  expect(wrapper).toMatchSnapshot()
})
