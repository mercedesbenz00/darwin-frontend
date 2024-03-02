import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { WorkviewImage } from '@/components/WorkView/BottomBar'

import { WorkviewImageProps as Type } from './types'

const localVue = createLocalVue()
localVue.directive('lazy', stubDirectiveWithAttribute)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: Type

beforeEach(() => {
  propsData = {
    filename: '1.png',
    thumbnail: '1_thumbnail.png'
  }
})

it('matches snapshot when not selected, not video', () => {
  const wrapper = shallowMount(WorkviewImage, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected, not video', () => {
  propsData.selected = true
  const wrapper = shallowMount(WorkviewImage, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not selected, video', () => {
  propsData.isVideo = true
  const wrapper = shallowMount(WorkviewImage, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
