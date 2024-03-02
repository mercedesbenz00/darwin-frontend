import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildAnnotationClassPayload } from 'test/unit/factories'

import SubAnnotationItem from '@/components/WorkView/LayerBar/LayerBarItem/SubAnnotations/SubAnnotationItem.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
let propsData: {
  annotationClass: AnnotationClassPayload
  type: string
  readonly?: boolean
}
let slots: { default: string }

beforeEach(() => {
  propsData = {
    annotationClass: buildAnnotationClassPayload({ id: 1 }),
    type: 'polygon'
  }
  slots = {
    default: 'slot content'
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(SubAnnotationItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(SubAnnotationItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  const wrapper = shallowMount(SubAnnotationItem, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})
