import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildDatasetFolderPayload } from 'test/unit/factories'
import { Card } from 'test/unit/stubs'

import DatasetFolderCard from '@/components/DatasetManagement/Card/V1/DatasetFolderCard.vue'

const localVue = createLocalVue()
const mocks = { $route: { query: {} } }
const stubs: Stubs = { Card }

it('matches snapshot', () => {
  const propsData = { data: buildDatasetFolderPayload({ dataset_id: 1 }) }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when path is specified', () => {
  const propsData = { data: buildDatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }) }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when path is specified', () => {
  const propsData = { data: buildDatasetFolderPayload({ dataset_id: 1, path: '/test/folder', url: 'foo.png' }) }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder has children', () => {
  const propsData = {
    data: buildDatasetFolderPayload({
      dataset_id: 1,
      children: [buildDatasetFolderPayload()],
      direct_item_count_filtered: 1,
      path: '/test/folder',
      url: 'foo.png'
    })
  }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in open dataset', () => {
  const propsData = {
    data: buildDatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }),
    readonly: true,
    urlPrefix: '/url-prefix-open'
  }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
