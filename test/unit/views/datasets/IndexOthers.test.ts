import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetPayload } from 'test/unit/factories'

import escDirective from '@/directives/esc'
import loadingDirective from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import IndexOthers from '@/views/datasets/IndexOthers.vue'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)
localVue.use(VModal)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.directive('loading', loadingDirective)
localVue.directive('esc', escDirective)
localVue.directive('tooltip', () => { })
localVue.use(VueLazyload)

let mocks: {
  $theme: ReturnType<typeof createMockTheme>,
  $can: () => boolean
}

let store: ReturnType<typeof createTestStore>

const fooDataset = buildDatasetPayload({ id: 1, name: 'Foo' })
const barDataset = buildDatasetPayload({ id: 2, name: 'Bar' })

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $can: () => false,
    $theme: createMockTheme()
  }
})

it('matches snapshot', () => {
  store.commit('dataset/SET_DATASETS', [fooDataset, barDataset])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when team owner', () => {
  mocks.$can = () => true
  store.commit('dataset/SET_DATASETS', [fooDataset, barDataset])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  expect(wrapper).toMatchSnapshot()
})

it('renders list of datasets', () => {
  store.commit('dataset/SET_DATASETS', [fooDataset, barDataset])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  expect(wrapper.findAll('dataset-card-stub').length).toEqual(2)
})

it('sorts by inserted_at', async () => {
  const older = buildDatasetPayload({ id: 1, name: 'Older', inserted_at: '2019-06-11 00:00:00' })
  const newer = buildDatasetPayload({ id: 2, name: 'Newer', inserted_at: '2019-06-13 00:00:00' })
  store.commit('dataset/SET_DATASETS', [older, newer])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'inserted_at')
  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()

  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by updated_at', async () => {
  const older = buildDatasetPayload({ id: 1, name: 'Older', updated_at: '2019-06-11 00:00:00' })
  const newer = buildDatasetPayload({ id: 2, name: 'Newer', updated_at: '2019-06-13 00:00:00' })
  store.commit('dataset/SET_DATASETS', [older, newer])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'updated_at')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by name', async () => {
  const barDataset = buildDatasetPayload({ id: 1, name: 'Bar' })
  const fooDataset = buildDatasetPayload({ id: 2, name: 'Foo' })
  store.commit('dataset/SET_DATASETS', [fooDataset, barDataset])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'name')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by progress', async () => {
  const lessProgress = buildDatasetPayload({ id: 1, progress: 0.5 })
  const moreProgress = buildDatasetPayload({ id: 2, progress: 0.9 })
  store.commit('dataset/SET_DATASETS', [lessProgress, moreProgress])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'progress')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by num_classes', async () => {
  const lessClasses = buildDatasetPayload({ id: 1, num_classes: 2 })
  const moreClasses = buildDatasetPayload({ id: 2, num_classes: 3 })
  store.commit('dataset/SET_DATASETS', [lessClasses, moreClasses])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'num_classes')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by num_images', async () => {
  const lessImages = buildDatasetPayload({ id: 1, num_images: 2 })
  const moreImages = buildDatasetPayload({ id: 2, num_images: 3 })
  store.commit('dataset/SET_DATASETS', [lessImages, moreImages])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'num_images')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('sorts by num_annotations', async () => {
  const lessAnnotators = buildDatasetPayload({ id: 1, num_annotations: 2 })
  const moreAnnotators = buildDatasetPayload({ id: 2, num_annotations: 3 })
  store.commit('dataset/SET_DATASETS', [lessAnnotators, moreAnnotators])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  wrapper.find('sort-dropdown-stub').vm.$emit('change', 'num_annotations')

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'asc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(1)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(2)

  wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').id).toEqual(2)
  expect(wrapper.findAll('dataset-card-stub').at(1).props('data').id).toEqual(1)
})

it('searches', async () => {
  const fooDataset = buildDatasetPayload({ id: 1, name: 'Foo' })
  const barDataset = buildDatasetPayload({ id: 2, name: 'Bar' })
  const bazDataset = buildDatasetPayload({ id: 3, name: 'Baz' })

  store.commit('dataset/SET_DATASETS', [fooDataset, barDataset, bazDataset])

  const wrapper = shallowMount(IndexOthers, { localVue, mocks, store })

  const searchField = wrapper.find('search-field-stub')
  searchField.vm.$emit('input', 'Foo')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(1)
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').name).toEqual('Foo')

  searchField.vm.$emit('input', 'Ba')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').length).toEqual(2)

  searchField.vm.$emit('input', 'Bar')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(1)
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').name).toEqual('Bar')

  searchField.vm.$emit('input', 'Baz')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub')).toHaveLength(1)
  expect(wrapper.findAll('dataset-card-stub').at(0).props('data').name).toEqual('Baz')

  searchField.vm.$emit('input', 'Bat')
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('dataset-card-stub').length).toEqual(0)
})
