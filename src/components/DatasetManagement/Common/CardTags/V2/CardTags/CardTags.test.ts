import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload } from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import { AnnotationClassPayload } from '@/store/types'

import CardTags from './CardTags.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.component('ResizeObserver', { template: '<div />' })

const mocks = {
  $theme: createMockTheme()
}
let propsData: {
  tags: AnnotationClassPayload[]
}
const stubs = { VPopover }

beforeEach(() => {
  propsData = {
    tags: [
      buildAnnotationClassPayload({
        id: 1,
        name: 'test1',
        annotation_types: ['tag'],
        metadata: { _color: '#FFFFFF' }
      }),
      buildAnnotationClassPayload({
        id: 2,
        name: 'test2',
        annotation_types: ['tag'],
        metadata: { _color: '#BBBBBB' }
      }),
      buildAnnotationClassPayload({
        id: 3,
        name: 'longlonglonglonglongtest3',
        annotation_types: ['tag'],
        metadata: { _color: '#888888' }
      }),
      buildAnnotationClassPayload({
        id: 4,
        name: 'longlonglonglonglongtest3',
        annotation_types: ['tag'],
        metadata: { _color: '#000000' }
      })
    ]
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(CardTags, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with no tags', () => {
  propsData.tags = []
  const wrapper = shallowMount(CardTags, { localVue, mocks, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
