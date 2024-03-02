import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'

import AnnotationTypeSelect
  from '@/components/Classes/AnnotationClassDialog/components/AnnotationTypeSelect.vue'
import { AnnotationTypeName } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const store = createTestStore()
setDefaultAnnotationTypes(store)

let propsData: {
  error?: string
  editing?: boolean
  selectedAnnotationType: AnnotationTypeName | null
}

beforeEach(() => {
  propsData = {
    selectedAnnotationType: null
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotationTypeSelect, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when one is selected', () => {
  propsData.selectedAnnotationType = 'polygon'

  const wrapper = shallowMount(AnnotationTypeSelect, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when there is error', () => {
  propsData.error = 'Error'

  const wrapper = shallowMount(AnnotationTypeSelect, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits updates', async () => {
  const wrapper = shallowMount(AnnotationTypeSelect, { localVue, propsData, store })
  await wrapper.findAll('annotation-type-item-stub').at(0).vm.$emit('click')
  expect(wrapper.emitted()['update:selectedAnnotationType']).toEqual([['polygon']])
})
