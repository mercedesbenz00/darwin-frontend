import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import { createTestStore, setDefaultAnnotationTypes } from 'test/unit/createTestStore'
import { buildAnnotationClassImagePayload, buildAnnotationClassPayload } from 'test/unit/factories'

import InstructionClass from '@/components/DatasetCreate/Instructions/InstructionClass.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)
localVue.use(Vuex)

const store = createTestStore()
setDefaultAnnotationTypes(store)

it('matches the snapshot with image', () => {
  const propsData = {
    data: buildAnnotationClassPayload({
      id: 1,
      images: [buildAnnotationClassImagePayload({ crop_url: '/flask.png' })]
    })
  }
  const wrapper = shallowMount(InstructionClass, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
