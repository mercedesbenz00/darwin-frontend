import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { flask } from 'test/unit/fixtures/annotation-class-payloads'

import HideByClassItem
  from '@/components/WorkView/LayerBar/AnnotationControl/HideByClass/HideByClassItem.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  annotationClass: AnnotationClassPayload,
  count: number,
  selected?: boolean
}

beforeEach(() => {
  propsData = {
    annotationClass: flask,
    count: 5
  }
})

const store = createTestStore()
setDefaultAnnotationTypes(store)

it('matches snapshot', () => {
  const wrapper = shallowMount(HideByClassItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.selected = true
  const wrapper = shallowMount(HideByClassItem, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits click when click on the root div', async () => {
  const wrapper = shallowMount(HideByClassItem, { localVue, propsData, store })
  await wrapper.find('.hide-by-class-item').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
