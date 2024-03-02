import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { flask, tag } from 'test/unit/fixtures/annotation-class-payloads'
import { buttonEvents } from 'test/unit/testHelpers'

import ClassFilterItem from '@/components/DatasetFiltering/ClassFilter/V1/ClassFilterItem.vue'
import { ClassFilterItemType } from '@/components/DatasetFiltering/ClassFilter/V1/types'
import { installCommonComponents } from '@/plugins/components'
import { TriToggleStatus } from '@/utils'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(Vuex)
installCommonComponents(localVue)

// store is read-only in this component, so can be shared
const store = createTestStore()
setDefaultAnnotationTypes(store)

let propsData: {
  data: ClassFilterItemType
  actionDisabled?: boolean
  actionHide?: boolean
  status?: TriToggleStatus
}

beforeEach(() => {
  propsData = {
    data: {
      id: 1,
      aclass: { ...tag, id: 1 },
      label: 'Tag',
      icon: 'tag.svg',
      count: 5
    }
  }
})

const mocks = {
  $theme: createMockTheme()
}

it('matches snapshot when not taggable', () => {
  propsData = {
    data: {
      id: 1,
      aclass: { ...flask, id: 1 },
      label: 'Polygon',
      icon: 'polygon.svg',
      count: 1
    },
    status: 'none'
  }
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when positive', () => {
  propsData.status = 'positive'
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when negative', () => {
  propsData.status = 'negative'
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when none', () => {
  propsData.status = 'none'
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when action hidden', () => {
  propsData.actionHide = true
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('emit click if you click on wrapper', async () => {
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  await wrapper.find('.class-filter-item').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})

it('emit shift-click if you click on wrapper', async () => {
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  await wrapper.find('.class-filter-item').trigger('click', { shiftKey: true })
  expect(wrapper.emitted()['shift-click']).toBeDefined()
})

it('emit tag when you click tag', async () => {
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  await wrapper.find('.class-filter-item__tag').vm.$emit('click', buttonEvents)
  expect(wrapper.emitted().tag).toBeDefined()
})

it('emit untag when you click untag', async () => {
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  await wrapper.find('.class-filter-item__untag').vm.$emit('click', buttonEvents)
  expect(wrapper.emitted().untag).toBeDefined()
})

it('never emit untag when you click disabled untag', async () => {
  propsData.actionDisabled = true
  const wrapper = shallowMount(ClassFilterItem, { localVue, propsData, store, mocks })
  await wrapper.find('.class-filter-item__untag').vm.$emit('click', buttonEvents)
  expect(wrapper.emitted().untag).toBeUndefined()
})
