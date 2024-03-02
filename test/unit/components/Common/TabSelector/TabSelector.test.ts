import { createLocalVue, shallowMount } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import TabSelector from '@/components/Common/TabSelector/TabSelector.vue'
import { TabSelectorOption } from '@/components/Common/TabSelector/types'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)

let options: TabSelectorOption[]
let propsData: {
  options: TabSelectorOption[],
  value: string
}

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(TabSelector, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

const itRendersSelection = () => it('renders selection', async () => {
  const wrapper = shallowMount(TabSelector, { localVue, propsData })
  expect(
    wrapper.findAll('.tab-select__button').at(0).classes()
  ).toContain('tab-select__button--active')

  await wrapper.setProps({ value: 'bar' })

  expect(
    wrapper.findAll('.tab-select__button').at(0).classes()
  ).not.toContain('tab-select__button--active')
  expect(
    wrapper.findAll('.tab-select__button').at(1).classes()
  ).toContain('tab-select__button--active')
})

const itEmitsSelection = () => it('emits selection', async () => {
  const wrapper = shallowMount(TabSelector, { localVue, propsData })
  expect(wrapper.emitted().change).not.toBeDefined()

  await wrapper.findAll('.tab-select__button').at(1).trigger('click')
  expect(wrapper.emitted().change![0]).toEqual(['bar'])

  await wrapper.findAll('.tab-select__button').at(0).trigger('click')
  expect(wrapper.emitted().change![1]).toEqual(['foo'])
})

const itRendersLabel = () => it('renders label', () => {
  const wrapper = shallowMount(TabSelector, { localVue, propsData })
  expect(wrapper.findAll('.tab-select__button').at(0).text()).toEqual('Foo')
  expect(wrapper.findAll('.tab-select__button').at(1).text()).toEqual('Bar')
})

const itRendersDescription = () => it('renders description', () => {
  const wrapper = shallowMount(TabSelector, { localVue, propsData })
  expect(wrapper.findAll('.tab-select__button').at(0).attributes('tooltip'))
    .toEqual('Foo description')
  expect(wrapper.findAll('.tab-select__button').at(1).attributes('tooltip'))
    .toEqual('Bar description')
})

describe('given just value options', () => {
  beforeEach(() => {
    options = [{ value: 'foo' }, { value: 'bar' }]
    propsData = { options, value: 'foo' }
  })

  itMatchesSnapshot()
  itRendersSelection()
  itEmitsSelection()
})

describe('given options with value and label', () => {
  beforeEach(() => {
    options = [{ value: 'foo', label: 'Foo' }, { value: 'bar', label: 'Bar' }]
    propsData = { options, value: 'foo' }
  })

  itMatchesSnapshot()
  itRendersSelection()
  itEmitsSelection()
  itRendersLabel()
})

describe('given options with value and description', () => {
  beforeEach(() => {
    options = [
      { value: 'foo', description: 'Foo description' },
      { value: 'bar', description: 'Bar description' }
    ]
    propsData = { options, value: 'foo' }
  })

  itMatchesSnapshot()
  itRendersSelection()
  itEmitsSelection()
  itRendersDescription()
})

describe('given full options', () => {
  beforeEach(() => {
    options = [
      { value: 'foo', description: 'Foo description', label: 'Foo' },
      { value: 'bar', description: 'Bar description', label: 'Bar' }
    ]
    propsData = { options, value: 'foo' }
  })

  itMatchesSnapshot()
  itRendersSelection()
  itEmitsSelection()
  itRendersLabel()
  itRendersDescription()
})
