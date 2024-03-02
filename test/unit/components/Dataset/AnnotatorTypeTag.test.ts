import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'
import Vuex from 'vuex'

import AnnotatorTypeTag from '@/components/Dataset/AnnotatorTypeTag.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)
localVue.use(Vuex)

const propsData = { annotatorType: { id: 'annotate', label: 'ANNOTATOR', icon: 'icon.svg' } }
const wrapper = shallowMount(AnnotatorTypeTag, { localVue, propsData })

it('matches snapshot', () => {
  expect(wrapper).toMatchSnapshot()
})
