import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetImagePayload,
  buildDatasetVideoPayload
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { WorkflowImage } from '@/components/WorkView/BottomBar'

import { WorkflowImageProps as Type } from './types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: Type
let mocks: {
  $route: {
    name: string,
    query: Record<string, string>,
    params: Record<string, string>
  }
}

const stubs = ['router-link']

const itemWithoutWorkflow = buildDatasetItemPayload({
  id: 1,
  dataset_image_id: 1,
  dataset_image: buildDatasetImagePayload({ id: 1 })
})

beforeEach(() => {
  store = createTestStore()
  propsData = { datasetItem: itemWithoutWorkflow }
  mocks = { $route: { name: 'Workflow', query: {}, params: {} } }
})

it('matches snapshot for item without workflow', async () => {
  const wrapper = shallowMount(WorkflowImage, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot('unselected')
  store.commit('workview/SET_SELECTED_DATASET_ITEM', itemWithoutWorkflow)
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot('selected')
})

it('matches snapshot for item with workflow', async () => {
  const datasetImage = buildDatasetImagePayload({ id: 1 })
  const item = initializeARWorkflow({ id: 1, dataset_image: datasetImage, dataset_image_id: datasetImage.id })
  propsData.datasetItem = item

  const wrapper = shallowMount(WorkflowImage, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot('unselected')
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot('selected')
})

it('renders different router link based on current route', () => {
  const datasetImage = buildDatasetImagePayload({ id: 1 })

  propsData.datasetItem = initializeARWorkflow({
    id: 1,
    dataset_image: datasetImage,
    dataset_image_id: datasetImage.id
  })

  const RouterLink = localVue.extend({
    name: 'router-view',
    props: ['to'],
    template: '<a class="router-view-stub"><slot/></a>'
  })

  const stubs = { 'router-link': RouterLink }

  const workviewWrapper = shallowMount(WorkflowImage, { localVue, mocks, propsData, store, stubs })
  expect(workviewWrapper.findComponent(RouterLink).props('to')).toEqual({
    name: 'Workflow',
    query: { image: -1 }
  })

  mocks.$route.name = 'OpenDatasetsView'
  mocks.$route.params = { teamSlug: 'v7', datasetSlug: 'sfh' }
  const openDatasetsWrapper = shallowMount(WorkflowImage, { localVue, mocks, propsData, store, stubs })
  expect(openDatasetsWrapper.findComponent(RouterLink).props('to')).toEqual({
    name: 'OpenDatasetsView',
    params: { datasetImageSeq: -1, datasetSlug: 'sfh', teamSlug: 'v7' }
  })
})

it('matches snapshot for video item', async () => {
  const item = buildDatasetItemPayload({
    id: 1,
    dataset_video_id: 1,
    dataset_video: buildDatasetVideoPayload({ id: 1, annotate_as_video: true })
  })
  propsData.datasetItem = item

  const wrapper = shallowMount(WorkflowImage, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot('unselected')
  store.commit('workview/SET_SELECTED_DATASET_ITEM', itemWithoutWorkflow)
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot('selected')
})
