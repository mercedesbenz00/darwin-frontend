import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import { cloneDeep } from 'lodash'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import escDirective from '@/directives/esc'
import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import dataset from '@/store/modules/dataset'
import datasetUpload from '@/store/modules/datasetUpload'
import { RootState } from '@/store/types'
import DatasetCreationView from '@/views/datasets/create/DatasetCreationView.vue'

const $theme = {
  getCurrentBreakpoint: () => 48,
  getCurrentScale: () => 1
}

const setupLocalVue = () => {
  const localVue = createLocalVue()

  localVue.use(Vuex)
  localVue.use(VModal)
  localVue.directive('loading', loadingDirective)
  localVue.directive('tooltip', () => {})
  localVue.directive('esc', escDirective)
  localVue.use(VueLazyload)
  installCommonComponents(localVue)

  return localVue
}

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      datasetUpload: { ...datasetUpload, state: cloneDeep(datasetUpload.state) },
      dataset: { ...dataset, state: cloneDeep(dataset.state) }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const stubs: Stubs = {
  'dataset-create-step-items': true,
  'router-view': true
}
const createMountDefaults = () => ({
  stubs,
  mocks: {
    $theme,
    $featureEnabled: (): boolean => false,
    $route: { params: {} }
  }
})

it('matches snapshot', () => {
  const localVue = setupLocalVue()
  const store = newStore()

  const wrapper = shallowMount(DatasetCreationView, {
    ...createMountDefaults(),
    localVue,
    store
  })
  expect(wrapper).toMatchSnapshot()
})

it('shows upload progress if any', async () => {
  const localVue = setupLocalVue()
  const store = newStore()

  const wrapper = shallowMount(DatasetCreationView, {
    ...createMountDefaults(),
    localVue,
    store
  })

  expect(wrapper.find('upload-progress-button-stub').exists()).toBe(false)
  store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('upload-progress-button-stub').exists()).toBe(true)
})

describe('continueLater', () => {
  it('navigates to datasets overview if dataset not created yet', async () => {
    const localVue = setupLocalVue()
    const store = newStore()

    const wrapper = shallowMount(DatasetCreationView, {
      localVue,
      store,
      stubs: ['router-link', 'router-view'],
      mocks: {
        $theme,
        $featureEnabled: (): boolean => false,
        $route: { params: {} },
        $router: { push: jest.fn() }
      }
    })

    const component = wrapper.vm as any
    component.continueLater()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'DatasetsOverview' })
  })

  it('navigates to data tab if dataset created', async () => {
    const localVue = setupLocalVue()
    const store = newStore()

    const wrapper = shallowMount(DatasetCreationView, {
      localVue,
      store,
      stubs,
      mocks: {
        $theme,
        $featureEnabled: (): boolean => false,
        $route: { params: { datasetId: '1' } },
        $router: { push: jest.fn() }
      }
    })

    const component = wrapper.vm as any
    component.continueLater()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$router.push)
      .toHaveBeenCalledWith({ name: 'DatasetManagementData', params: { datasetId: '1' } })
  })
})

describe('title', () => {
  it('renders correctly if dataset not created yet', () => {
    const localVue = setupLocalVue()
    const store = newStore()

    const wrapper = shallowMount(DatasetCreationView, {
      localVue,
      store,
      stubs,
      mocks: {
        $theme,
        $featureEnabled: (): boolean => false,
        $route: { params: {} }
      }
    })

    expect((wrapper.vm as any).title).toEqual('Create new dataset')
  })

  it('renders correctly if dataset created', async () => {
    const localVue = setupLocalVue()
    const store = newStore()

    const wrapper = shallowMount(DatasetCreationView, {
      localVue,
      store,
      stubs,
      mocks: {
        $theme,
        $featureEnabled: (): boolean => false,
        $route: { params: { datasetId: '1' } }
      }
    })

    store.commit('dataset/PUSH_DATASET', { id: 1, name: 'foo' })
    await wrapper.vm.$nextTick()

    expect((wrapper.vm as any).title).toEqual('Create foo')
  })
})
