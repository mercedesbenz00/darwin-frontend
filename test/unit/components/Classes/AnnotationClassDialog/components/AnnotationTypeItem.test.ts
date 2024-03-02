import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import AnnotationTypeItem from '@/components/Classes/AnnotationClassDialog/components/AnnotationTypeItem.vue'
import { AnnotationTypeName } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  typeName: AnnotationTypeName
  disabled?: boolean
  selected?: boolean
}

const mocks = { $theme: createMockTheme() }

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  propsData = {
    typeName: 'polygon',
    disabled: false,
    selected: false
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotationTypeItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData.disabled = true
  const wrapper = shallowMount(AnnotationTypeItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.selected = true
  const wrapper = shallowMount(AnnotationTypeItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when link tool and feature disabled', () => {
  propsData.typeName = 'link'
  const wrapper = shallowMount(AnnotationTypeItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when link tool', () => {
  propsData.typeName = 'link'
  store.commit('features/SET_FEATURES', [{ name: 'LINK_TOOL', enabled: true }])
  const wrapper = shallowMount(AnnotationTypeItem, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
