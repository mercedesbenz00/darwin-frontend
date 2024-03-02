import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildAnnotationClassPayload } from 'test/unit/factories'

import CardTagItem from './CardTagItem.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.component('ResizeObserver', { template: '<div />' })

it('matches snapshot', () => {
  const propsData = {
    data: buildAnnotationClassPayload({ id: 1, metadata: { _color: 'rgba(0,0,0,1.0)' } })
  }
  const wrapper = shallowMount(CardTagItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot showing tooltip', () => {
  const propsData = {
    data: buildAnnotationClassPayload({ id: 1, metadata: { _color: 'rgba(0,0,0,1.0)' } }),
    showTooltip: true
  }
  const wrapper = shallowMount(CardTagItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
