import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import { installCommonComponents } from '@/plugins/components'
import Overview from '@/views/datasets/detail/Overview/Overview.vue'

const localVue = createLocalVue()
localVue.use(Router)
localVue.use(Vuex)
installCommonComponents(localVue)

const createRouter = (): Router => {
  const router =
    new Router({
      routes: [
        { name: 'Workflow', path: '/workview' }
      ]
    })

  router.push('/')

  return router
}

let router: Router
let store: ReturnType<typeof createTestStore>

const sfhDataset = buildDatasetPayload({
  id: 1,
  name: 'Dataset'
})

const stubs: Stubs = {
  'dataset-detail-layout': DatasetDetailLayout,
  'export-button': true,
  'overview-content': true
}

beforeEach(() => {
  router = createRouter()
  store = createTestStore()
})

it('matches snapshot for v1', () => {
  const propsData = { dataset: sfhDataset }
  const wrapper = shallowMount(Overview, { localVue, propsData, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot for v2', () => {
  const propsData = { dataset: { ...sfhDataset, version: 2 } }
  const wrapper = shallowMount(Overview, { localVue, propsData, router, store })
  expect(wrapper).toMatchSnapshot()
})
