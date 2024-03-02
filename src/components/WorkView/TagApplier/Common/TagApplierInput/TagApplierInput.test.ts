import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { BadgeType } from '@/components/Common/Badge'

import TagApplierInput from './TagApplierInput.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

let propsData: {
  keyword: string,
  items: BadgeType[],
  disabled?: boolean,
  canCreate?: boolean,
}

beforeEach(() => {
  propsData = {
    keyword: '',
    items: []
  }
  wrapper = shallowMount(TagApplierInput, {
    propsData,
    localVue
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('TagApplierInput', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain the right placeholder with empty list', async () => {
    await wrapper.setProps({ items: [] })
    const input = wrapper.find('.input-field')
    expect(input.attributes().placeholder).toBe('Type to search or add a tag')
  })

  it('should contain the right placeholder with filled list', async () => {
    await wrapper.setProps({ items: ['foo', 'bar', 'baz'] })
    const input = wrapper.find('.input-field')
    expect(input.attributes().placeholder).toBe('Type to search or add a tag')
  })

  it('emit change', async () => {
    await wrapper.setProps({ keyword: 'tag-name' })
    await wrapper.vm.$emit('change', 'tag-name')
    expect(wrapper.emitted().change).toEqual([['tag-name']])
  })

  it('emit create', async () => {
    await wrapper.setProps({ keyword: 'tag-name' })
    await wrapper.vm.$emit('create', 'tag-name')
    expect(wrapper.emitted().create).toEqual([['tag-name']])
  })

  it('emit delete', async () => {
    await wrapper.setProps({ keyword: 'tag-name' })
    await wrapper.vm.$emit('delete', 'tag-name')
    expect(wrapper.emitted().delete).toEqual([['tag-name']])
  })

  it('emit keydown', async () => {
    await wrapper.setProps({ keyword: 'tag-name' })
    await wrapper.vm.$emit('keydown', 'tag-name')
    expect(wrapper.emitted().keydown).toEqual([['tag-name']])
  })
})

describe('when submitting using arrow keys', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    propsData = {
      keyword: 'foo',
      items: []
    }
    wrapper = shallowMount(TagApplierInput, { localVue, propsData })
  })

  it('select the next value focused and hitting ARROW DOWN', async () => {
    await wrapper.setData({ focused: true })
    await document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(wrapper.emitted()['focus:list']).toEqual([[]])
  })

  it('do not select the next value not focused and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect(wrapper.emitted()['focus:list']).not.toBeDefined()
  })

  it('select the prev value open and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(wrapper.emitted()['focus:list']).toEqual([[]])
  })

  it('do not select the prev value not focused and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect(wrapper.emitted()['focus:list']).not.toBeDefined()
  })

  it('submit the selected value when focused and hitting ENTER', async () => {
    await wrapper.setData({ focused: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.create).toEqual([['foo']])
  })

  it('not submit the selected value when not focused and hitting ENTER', async () => {
    await wrapper.setData({ focused: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.create).not.toBeDefined()
  })
})
