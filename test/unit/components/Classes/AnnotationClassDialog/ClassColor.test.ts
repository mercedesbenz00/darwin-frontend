import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { VPopover } from 'test/unit/stubs'

import ClassColor from '@/components/Classes/AnnotationClassDialog/ClassColor.vue'

const localVue = createLocalVue()

const stubs: Stubs = { VPopover }
let propsData: {
  color?: string
}

beforeEach(() => {
  propsData = {}
})

it('matches snapshot with default props', () => {
  const wrapper = shallowMount(ClassColor, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when color is set', () => {
  propsData.color = '#000000'
  const wrapper = shallowMount(ClassColor, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits the color updates when color is selected', async () => {
  const wrapper = shallowMount(ClassColor, { localVue, propsData, stubs })
  await wrapper.find('color-picker-stub').vm.$emit('select', '#000000')
  expect(wrapper.emitted()['update:color']).toEqual([['#000000']])
})
