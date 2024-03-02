import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'

import Sidebar from '@/components/Classes/Sidebar/Sidebar.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import loading from '@/directives/loading'
import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()

localVue.directive('loading', loading)
localVue.directive('click-outside', () => {})
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const aclasses = [
  buildAnnotationClassPayload({ name: 'polygon' }),
  buildAnnotationClassPayload({ name: 'tag' })
]
const mocks = {
  $theme: createMockTheme(),
  $route: { name: '', params: {}, query: {} }
}
let propsData: {
  dataset?: DatasetPayload | null
  loading?: boolean
}

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1 }))
  store.commit('aclass/SET_CLASSES', aclasses)
  store.commit('aclass/SET_CLASS_DETAILS', {
    annotation_classes: aclasses,
    type_counts: [
      { name: 'All', count: 2 },
      { name: 'polygon', id: 1, count: 1 },
      { name: 'tag', id: 2, count: 1 }
    ]
  })
  propsData = {}
})

const stubs: Stubs = {
  'check-list-dropdown': true,
  'sort-dropdown': true
}

it('matches snapshot', async () => {
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loading', async () => {
  propsData.loading = true
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with dataset', async () => {
  propsData.dataset = buildDatasetPayload()
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('emits create event when you click on create button', async () => {
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })
  await flushPromises()
  await wrapper.find('.classes-sidebar__create').vm.$emit('click')
  expect(wrapper.emitted().create).toBeDefined()
})

describe('change layout mode', () => {
  it('changes view mode when switch layout on sidebar', async () => {
    const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })
    await flushPromises()
    jest.spyOn(store, 'commit').mockReturnValue()
    await wrapper.find('switch-gallery-layout-stub').vm.$emit('change', VIEW_MODE.LIST)
    expect(store.commit).toHaveBeenCalledWith('aclass/SET_CLASSES_TAB_VIEW_MODE', VIEW_MODE.LIST)
  })
})

it('syncs sort direction field with store', async () => {
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })

  await flushPromises()
  await wrapper.find('sort-dropdown-stub').vm.$emit('change', 'id')
  expect(store.state.aclass.classesTabSortBy).toEqual('id')
  expect(store.state.aclass.classesTabSortDirection).toEqual('asc')
})

it('syncs sort direction change with store', async () => {
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })

  await flushPromises()
  await wrapper.find('sort-dropdown-stub').vm.$emit('change-direction', 'desc')
  expect(store.state.aclass.classesTabSortBy).toEqual('id')
  expect(store.state.aclass.classesTabSortDirection).toEqual('desc')
})

it('syncs filtered type with store', async () => {
  const wrapper = shallowMount(Sidebar, { localVue, propsData, store, mocks, stubs })

  await flushPromises()
  await wrapper.find('annotation-type-filter-stub').vm.$emit('change', ['bounding_box', 'polygon'])
  expect(store.state.aclass.classesTabSelectedTypeNames).toEqual(['bounding_box', 'polygon'])
})
