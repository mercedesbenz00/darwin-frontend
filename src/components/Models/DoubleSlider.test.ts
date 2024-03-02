import { createLocalVue, shallowMount } from '@vue/test-utils'

import DoubleSlider from '@/components/Models/DoubleSlider.vue'

const localVue = createLocalVue()

const options = {
  bottomMarks: { foo: 'Foo Bottom Mark', bar: 'Bar Bottom Mark', baz: 'Baz Bottom Mark' },
  data: ['foo', 'bar', 'baz'],
  topMarks: { foo: 'Foo Top Mark', bar: 'Bar Top Mark', baz: 'Baz Top Mark' }
}

it('matches snapshot', () => {
  const propsData = { options, value: 'foo' }
  const wrapper = shallowMount(DoubleSlider, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits on selection change', async () => {
  const propsData = { options, value: 'foo' }
  const wrapper = shallowMount(DoubleSlider, { localVue, propsData })
  wrapper.findAll('slider-stub').at(1).vm.$emit('change', 'bar')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change![0]).toEqual(['bar'])
  wrapper.findAll('slider-stub').at(1).vm.$emit('change', 'baz')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().change).toBeDefined()
  expect(wrapper.emitted().change![1]).toEqual(['baz'])
})

it('updates value on both sliders when prop changes', async () => {
  const propsData = { options, value: 'foo' }
  const wrapper = shallowMount(DoubleSlider, { localVue, propsData })
  expect(wrapper.findAll('slider-stub').at(0).attributes('value')).toEqual('foo')
  expect(wrapper.findAll('slider-stub').at(1).attributes('value')).toEqual('foo')

  wrapper.setProps({ value: 'bar' })
  await wrapper.vm.$nextTick()
  expect(wrapper.findAll('slider-stub').at(0).attributes('value')).toEqual('bar')
  expect(wrapper.findAll('slider-stub').at(1).attributes('value')).toEqual('bar')
})
