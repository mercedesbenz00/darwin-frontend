import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import { buildDatasetPayload } from 'test/unit/factories'

import dataset from '@/store/modules/dataset'
import toast from '@/store/modules/toast'
import { RootState } from '@/store/types'
import Detail from '@/views/datasets/detail/Detail.vue'

const blankDataset = buildDatasetPayload({
  id: 1,
  name: '',
  slug: '',
  public: false,
  owner_id: -1,
  team_id: -1,
  archived: false,
  archived_at: null,
  active: true,
  progress: 0,
  work_size: 5,
  thumbnails: []
})

const localVue = createLocalVue()

localVue.use(Vuex)

const newStore = () => new Vuex.Store<RootState>({
  modules: {
    dataset: { ...dataset, state: cloneDeep(dataset.state) },
    toast: { ...(toast as any), state: cloneDeep(toast.state) }
  }
})

it('loads dataset from store on mount', async () => {
  const store = newStore()

  const spy = jest.spyOn(store, 'dispatch').mockResolvedValue({})

  const wrapper = shallowMount(Detail, {
    localVue,
    store,
    mocks: { $route: { params: { datasetId: '1' } } }
  })

  wrapper.vm.$route.params.datasetId = '2'

  await flushPromises()
  expect(spy).toHaveBeenCalledWith('dataset/resetCurrentDataset')
  expect(spy).toHaveBeenCalledWith('dataset/loadDataset', { datasetId: 1 })
})

it('matches dataset in store', async () => {
  const fooDataset = { ...blankDataset, name: 'Foo', id: 1 }

  const store = newStore()
  store.commit('dataset/PUSH_DATASET', fooDataset)

  jest.spyOn(store, 'dispatch').mockResolvedValue({})

  const wrapper = shallowMount(Detail, {
    localVue,
    store,
    mocks: { $route: { params: { datasetId: '1' } }, $can () { } },
    stubs: ['router-view']
  })

  const component = (wrapper.vm as any)
  await flushPromises()
  expect(component.dataset).toEqual(fooDataset)
})
