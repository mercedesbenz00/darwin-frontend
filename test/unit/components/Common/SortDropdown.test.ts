import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import SortDropdown from '@/components/Common/SortDropdown/V1/SortDropdown.vue'
import { DropdownOption } from '@/components/Common/SortDropdown/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  value: string | number,
  options: DropdownOption[],
  size?: 'small' | 'normal',
  direction?: 'asc' | 'desc'
}

const stubs: Stubs = { Select2: true }
const options = [
  { id: 'option1', icon: 'option1.svg', text: 'Option 1' },
  { id: 'option2', icon: 'option2.svg', text: 'Option 2' }
]

it('matches snapshot when asc', () => {
  propsData = {
    value: options[0].id,
    options,
    direction: 'asc'
  }
  const wrapper = shallowMount(SortDropdown, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emits input/change event when you select an option', () => {
  propsData = {
    value: options[0].id,
    options,
    direction: 'asc'
  }
  const wrapper = shallowMount(SortDropdown, { localVue, propsData, stubs })
  wrapper.find('select2-stub').vm.$emit('select', options[1])
  expect(wrapper.emitted().input).toEqual([[options[1].id]])
  expect(wrapper.emitted().change).toEqual([[options[1].id]])
})

it('emits change-direction when you click on sort button', () => {
  propsData = {
    value: options[0].id,
    options,
    direction: 'asc'
  }
  const wrapper = shallowMount(SortDropdown, { localVue, propsData, stubs })
  wrapper.find('button.sort-dropdown__direction').trigger('click')
  expect(wrapper.emitted()['change-direction']).toEqual([['desc']])
})
