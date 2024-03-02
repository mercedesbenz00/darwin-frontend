import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import {
  IconButton,
  ButtonColor,
  ButtonFlair,
  IconButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2'

const localVue = createLocalVue()
const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true
}

it('renders correctly', () => {
  const wrapper = shallowMount(IconButton, { localVue, stubs })
  expect(wrapper.find('.icon-button').exists()).toBe(true)
})

it('dispatches no action on click when disabled', async () => {
  const wrapper = shallowMount(IconButton, { localVue, stubs })
  const propsData = { disabled: true }
  await wrapper.setProps(propsData)
  const button = wrapper.find('.icon-button')
  await button.vm.$emit('click')
  button.emitted()
  expect(button.attributes().disabled).toBeTruthy()
  expect(button.emitted().click).toEqual([[]])
})

describe('show correct default slot content', () => {
  let wrapper: Wrapper<Vue>
  const slots = { default: { template: '<svg id="icon"/>' } }

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs, slots })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should contain an icon', () => {
    expect(wrapper.find('#icon').exists()).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the variants', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if variant it\'s default', async () => {
    const propsData = { variant: ButtonVariant.DEFAULT }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('variant--default')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if variant it\'s outline', async () => {
    const propsData = { variant: ButtonVariant.OUTLINE }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('variant--outline')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the colors', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if color it\'s transparent', async () => {
    const propsData = { color: ButtonColor.TRANSPARENT }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--transparent')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s primary', async () => {
    const propsData = { color: ButtonColor.PRIMARY }
    await wrapper.setProps(propsData)

    expect(wrapper.attributes().class.includes('color--primary')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s secondary', async () => {
    const propsData = { color: ButtonColor.SECONDARY }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--secondary')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s positive', async () => {
    const propsData = { color: ButtonColor.POSITIVE }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--positive')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s negative', async () => {
    const propsData = { color: ButtonColor.NEGATIVE }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--negative')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s warning', async () => {
    const propsData = { color: ButtonColor.WARNING }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--warning')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s informative', async () => {
    const propsData = { color: ButtonColor.INFORMATIVE }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--informative')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-annotation', async () => {
    const propsData = { color: ButtonColor.STAGE_ANNOTATION }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--stage-annotation')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-model', async () => {
    const propsData = { color: ButtonColor.STAGE_MODEL }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--stage-model')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-review', async () => {
    const propsData = { color: ButtonColor.STAGE_REVIEW }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--stage-review')).toBe(true)
    expect(wrapper.attributes().disabled).toBeFalsy()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the colors if it\'s disabled', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs, propsData: { disabled: true } })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if color it\'s transparent', async () => {
    const propsData = { color: ButtonColor.TRANSPARENT, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--transparent')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s primary', async () => {
    const propsData = { color: ButtonColor.PRIMARY, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--primary')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s secondary', async () => {
    const propsData = { color: ButtonColor.SECONDARY, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--secondary')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s positive', async () => {
    const propsData = { color: ButtonColor.POSITIVE, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--positive')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s negative', async () => {
    const propsData = { color: ButtonColor.NEGATIVE, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--negative')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s warning', async () => {
    const propsData = { color: ButtonColor.WARNING, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--warning')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s informative', async () => {
    const propsData = { color: ButtonColor.INFORMATIVE, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--informative')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-annotation', async () => {
    const propsData = { color: ButtonColor.STAGE_ANNOTATION, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--stage-annotation')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-model', async () => {
    const propsData = { color: ButtonColor.STAGE_MODEL, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('color--stage-model')).toBe(true)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if color it\'s stage-review', async () => {
    const propsData = { color: ButtonColor.STAGE_REVIEW, disabled: true }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().disabled).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the sizes', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if size it\'s mini', async () => {
    const propsData = { size: IconButtonSize.MINI }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('size--mini')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if size it\'s small', async () => {
    const propsData = { size: IconButtonSize.SMALL }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('size--small')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if size it\'s medium', async () => {
    const propsData = { size: IconButtonSize.MEDIUM }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('size--medium')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if size it\'s large', async () => {
    const propsData = { size: IconButtonSize.LARGE }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('size--large')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the flairs', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if flair it\'s super-soft', async () => {
    const propsData = { flair: ButtonFlair.SUPER_SOFT }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('flair--super-soft')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if flair it\'s soft', async () => {
    const propsData = { flair: ButtonFlair.SOFT }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('flair--soft')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if flair it\'s rounded', async () => {
    const propsData = { flair: ButtonFlair.ROUNDED }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('flair--rounded')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test all the tags', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(IconButton, { localVue, stubs })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes if tag it\'s a', async () => {
    const propsData = { tag: ButtonTag.A }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('tag--a')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if tag it\'s button', async () => {
    const propsData = { tag: ButtonTag.BUTTON }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('tag--button')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if tag it\'s div', async () => {
    const propsData = { tag: ButtonTag.DIV }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('tag--div')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes if tag it\'s router-link', async () => {
    const propsData = { tag: ButtonTag.ROUTER }
    await wrapper.setProps(propsData)
    expect(wrapper.attributes().class.includes('tag--router-link')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})
