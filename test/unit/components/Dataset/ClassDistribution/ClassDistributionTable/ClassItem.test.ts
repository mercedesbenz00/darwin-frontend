import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { scale } from 'test/unit/fixtures/annotation-class-payloads'
import { VPopover } from 'test/unit/stubs'

import ClassItem from '@/components/Dataset/ClassDistribution/ClassDistributionTable/ClassItem.vue'
import { AnnotationClassPayload } from '@/store/types'

const stubs = {
  VPopover
}

const localVue = createLocalVue()

localVue.use(Vuex)

let propsData: {
  annotationClass: AnnotationClassPayload
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  setDefaultAnnotationTypes(store)
  propsData = { annotationClass: scale }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ClassItem, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
