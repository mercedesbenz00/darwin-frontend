import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetFolderPayload } from 'test/unit/factories'
import { ListItem } from 'test/unit/stubs'

import DatasetFolderListItem from '@/components/DatasetManagement/ListItem/DatasetFolderListItem.vue'

const localVue = createLocalVue()
const mocks = { $route: { query: {} } }
const stubs = { ListItem }

it('matches snapshot', () => {
  const propsData = { data: buildDatasetFolderPayload() }
  const wrapper = shallowMount(DatasetFolderListItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot', () => {
  const propsData = { data: buildDatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }) }
  const wrapper = shallowMount(DatasetFolderListItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in open dataset', () => {
  const propsData = {
    data: buildDatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }),
    readonly: true,
    urlPrefix: '/url-prefix-open'
  }
  const wrapper = shallowMount(DatasetFolderListItem, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
