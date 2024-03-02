import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'

import { buildUserPayload, buildImagePayload } from 'test/unit/factories'

import { ReplyBoxProps } from '@/components/WorkView/Comment/types'
import VEnter from '@/directives/enter'
import VEsc from '@/directives/esc'
import { installCommonComponents } from '@/plugins/components'

import ReplyBox from './ReplyBox.vue'

const localVue = createLocalVue()
localVue.directive('enter', VEnter)
localVue.directive('esc', VEsc)
installCommonComponents(localVue)

let propsData: ReplyBoxProps

beforeEach(() => {
  const image = buildImagePayload({ url: 'url' })
  const author = buildUserPayload({ id: 1, first_name: 'Test', last_name: 'Me', image })
  propsData = { author }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(ReplyBox, { localVue, propsData })
  await flushPromises()
  expect(wrapper).toMatchSnapshot('focused')

  wrapper.setData({ hasFocus: false })
  await flushPromises()
  expect(wrapper).toMatchSnapshot('unfocused')
})

it('matches snapshot when sticky author', async () => {
  propsData.stickAuthor = true
  const wrapper = shallowMount(ReplyBox, { localVue, propsData })
  await flushPromises()
  expect(wrapper).toMatchSnapshot('focused')

  wrapper.setData({ hasFocus: false })
  await flushPromises()
  expect(wrapper).toMatchSnapshot('unfocused')
})

it('emits post event when you press enter in the textfield', () => {
  const wrapper = shallowMount(ReplyBox, { localVue, propsData })
  wrapper.setData({ body: 'comment' })
  wrapper.find('comment-edit-box-stub').vm.$emit('enter')
  expect(wrapper.emitted().post).toEqual([['comment']])
})
