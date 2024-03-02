import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassImagePayload, buildAnnotationClassPayload } from 'test/unit/factories'

import ToolClassSelectionItem from '@/components/WorkView/ToolClassSelection/ToolClassSelectionItem.vue'
import { AnnotationClassPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.directive('close-popover', () => {})
localVue.directive('lazy', stubDirectiveWithAttribute)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  annotationClass: AnnotationClassPayload
  hotkey?: string | null
  highlighted?: boolean
  selected?: boolean
}

beforeEach(() => {
  propsData = {
    annotationClass: buildAnnotationClassPayload({
      id: 1,
      annotation_types: ['bounding_box'],
      metadata: { _color: 'rgba(0, 0, 0, 0.1)' },
      description: 'description'
    })
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ToolClassSelectionItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with image url', () => {
  propsData.annotationClass.images = [buildAnnotationClassImagePayload({ crop_url: '1.jpg' })]
  const wrapper = shallowMount(ToolClassSelectionItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with hotkey', () => {
  propsData.hotkey = '1'
  const wrapper = shallowMount(ToolClassSelectionItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when highlighted', () => {
  propsData.highlighted = true
  const wrapper = shallowMount(ToolClassSelectionItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.selected = true
  const wrapper = shallowMount(ToolClassSelectionItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
