import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildDatasetAnnotatorPayload,
  buildDatasetItemPayload,
  buildTeamPayload
} from 'test/unit/factories'

import IndexAnnotators from '@/views/datasets/IndexAnnotators.vue'

const localVue = createLocalVue()

localVue.use(VueLazyload)
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('loading', () => {})

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(IndexAnnotators, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when datasets and stages exist', () => {
  const dataset = buildDatasetAnnotatorPayload({})
  const item = buildDatasetItemPayload({ dataset_id: dataset.id })
  store.commit('annotator/SET_DATASETS', [dataset])
  store.commit('annotator/PUSH_ITEMS', [item])

  const wrapper = shallowMount(IndexAnnotators, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('loads datasets when mounted', () => {
  shallowMount(IndexAnnotators, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('annotator/loadDatasets')
})

it('loads datasets on team change', async () => {
  shallowMount(IndexAnnotators, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledTimes(1)
  await flushPromises()

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 2 }))
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(2)

  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 3 }))
  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledTimes(3)
})
