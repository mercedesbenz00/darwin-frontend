import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vue from 'vue'

import { ModelType } from '@/store/types'
import { RGBA } from '@/utils'

import {
  V2ModelSelectionDropdownItem,
  ModelSelectionDropdownOption,
  ModelSelectionDropdownClassOption
} from '.'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

type ItemProp = {
  option: ModelSelectionDropdownOption,
  selected?: boolean,
}

let propsData: ItemProp

const classes: ModelSelectionDropdownClassOption[] = [
  { color: { r: 10, g: 10, b: 10, a: 0.1 } as RGBA, label: 'bar' },
  { color: { r: 20, g: 20, b: 20, a: 0.2 } as RGBA, label: 'baz' }
]

const defaultItem: ModelSelectionDropdownOption = {
  id: 'foo-1234',
  label: 'foo',
  type: ModelType.AutoAnnotation,
  classes
}

const itMatchesSnapshot = (propsData: ItemProp): void => it('matches snapshot', () => {
  const wrapper = shallowMount(V2ModelSelectionDropdownItem, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  option: defaultItem
})

it('is instanciated', () => {
  const _propsData = {
    option: defaultItem
  }

  const wrapper = shallowMount(V2ModelSelectionDropdownItem, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('has correct values', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    option: defaultItem
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(V2ModelSelectionDropdownItem, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.model__dropdown__item').exists()).toBe(true)
  })

  it('contain the right icon', () => {
    const icon = wrapper.find('.model__dropdown__item__icon')
    expect(icon.exists()).toBe(true)
    expect(icon.attributes().modeltype).toBe('auto_annotate')
  })

  it('contain the right label', () => {
    const label = wrapper.find('.model__dropdown__item__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('foo')
  })

  it('contain the right classes', () => {
    const badges = wrapper.find('badges-stub')
    expect(badges.exists()).toBe(true)
  })

  it('contain the right status', () => {
    const status = wrapper.find('.model__dropdown__item__status')
    expect(status.attributes().value).toBe('active')
  })
})
