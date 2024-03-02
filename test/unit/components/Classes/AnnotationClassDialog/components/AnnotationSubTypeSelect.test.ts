import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore, { setDefaultAnnotationTypes } from 'test/unit/createTestStore'

import AnnotationSubTypeSelect
  from '@/components/Classes/AnnotationClassDialog/components/AnnotationSubTypeSelect.vue'
import { AnnotationTypeName } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  mainAnnotationType: AnnotationTypeName
  originalSubTypeSelections: Partial<Record<AnnotationTypeName, boolean>>
  typeSelections: Partial<Record<AnnotationTypeName, boolean>>
}

const store = createTestStore()
setDefaultAnnotationTypes(store)

it('matches snapshot', () => {
  propsData = {
    mainAnnotationType: 'polygon',
    originalSubTypeSelections: { },
    typeSelections: { }
  }
  const wrapper = shallowMount(AnnotationSubTypeSelect, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when original and selected are different', () => {
  propsData = {
    mainAnnotationType: 'polygon',
    originalSubTypeSelections: { directional_vector: true },
    typeSelections: { directional_vector: true, attributes: true }
  }
  const wrapper = shallowMount(AnnotationSubTypeSelect, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits updates', async () => {
  propsData = {
    mainAnnotationType: 'polygon',
    originalSubTypeSelections: { directional_vector: true },
    typeSelections: { directional_vector: true }
  }
  const wrapper = shallowMount(AnnotationSubTypeSelect, { localVue, propsData, store })
  await wrapper.findAll('annotation-type-item-stub').at(0).vm.$emit('click')
  expect(wrapper.emitted()['update:typeSelections']).toEqual([[
    {
      attributes: true,
      directional_vector: true
    }
  ]])
})
