import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Router from 'vue-router'

import { buildV2DatasetFolderPayload } from 'test/unit/factories'
import { Card } from 'test/unit/stubs'

import DatasetFolderCard from './DatasetFolderCard.vue'

const localVue = createLocalVue()
localVue.use(Router)

const stubs: Stubs = { Card }
const router: Router = new Router()

it('matches snapshot', () => {
  const propsData = { data: buildV2DatasetFolderPayload({ dataset_id: 1 }) }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, router, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when path is specified', () => {
  const propsData = { data: buildV2DatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }) }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, router, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when path is specified', () => {
  const propsData = {
    data: buildV2DatasetFolderPayload({
      dataset_id: 1,
      path: '/test/folder',
      thumbnail_url: 'foo.png'
    })
  }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, router, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder has children', () => {
  const propsData = {
    data: buildV2DatasetFolderPayload({
      dataset_id: 1,
      children: [buildV2DatasetFolderPayload()],
      filtered_item_count: 1,
      path: '/test/folder',
      thumbnail_url: 'foo.png'
    })
  }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, router, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot in open dataset', () => {
  const propsData = {
    data: buildV2DatasetFolderPayload({ dataset_id: 1, path: '/test/folder' }),
    readonly: true,
    urlPrefix: '/url-prefix-open'
  }
  const wrapper = shallowMount(DatasetFolderCard, { localVue, router, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
