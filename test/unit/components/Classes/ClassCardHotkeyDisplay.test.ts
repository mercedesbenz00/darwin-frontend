import { createLocalVue, shallowMount } from '@vue/test-utils'

import {
  buildAnnotationClassPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import ClassCardHotkeyDisplay from '@/components/Classes/ClassCardHotkeyDisplay.vue'
import { AnnotationClassPayload, DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
let propsData: {
  annotationClass: AnnotationClassPayload
  dataset?: DatasetPayload | null
}

beforeEach(() => {
  propsData = {
    annotationClass: buildAnnotationClassPayload({ id: 1 })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ClassCardHotkeyDisplay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with dataset, without hotkey', () => {
  propsData.dataset = buildDatasetPayload({ id: 2 })
  const wrapper = shallowMount(ClassCardHotkeyDisplay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with dataset, with hotkey', () => {
  propsData.dataset = buildDatasetPayload({
    id: 2,
    annotation_hotkeys: { 3: 'select_class:1' }
  })
  const wrapper = shallowMount(ClassCardHotkeyDisplay, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
