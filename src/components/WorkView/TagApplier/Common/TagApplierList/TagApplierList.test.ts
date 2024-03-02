import { createLocalVue, mount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vue from 'vue'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { BadgeType } from '@/components/Common/Badge'

import TagApplierList from './TagApplierList.vue'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let wrapper: Wrapper<Vue>

const $theme = {
  getCurrentScale: (): number => 1
}

let propsData: {
  keyword: string,
  items: BadgeType[],
  direction?: 'asc' | 'desc',
  focused?: boolean,
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    keyword: '',
    items: [
      { label: 'foo' },
      { label: 'bar' },
      { label: 'baz' }
    ]
  }
  const mocks = { $theme }
  wrapper = mount(TagApplierList, { mocks, propsData, localVue, store })
})

afterEach(() => {
  wrapper.destroy()
})

describe('TagApplierList', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should match snapshot with defined label', async () => {
    await wrapper.setProps({ keyword: 'foo' })
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain list items', () => {
    const listItems = wrapper.findAll('.vue-recycle-scroller__item-view')
    expect(listItems.length).toBe(2) // because of the recycle-scroller
  })
})

describe('when submitting using arrow keys', () => {
  let wrapper: Wrapper<Vue, Element>

  beforeEach(() => {
    propsData = {
      keyword: '',
      items: [
        { label: 'foo' },
        { label: 'bar' },
        { label: 'baz' }
      ]
    }
    const mocks = { $theme }
    wrapper = mount(TagApplierList, { localVue, mocks, propsData, store })
  })

  it('select the next value focused and hitting ARROW DOWN', async () => {
    await wrapper.setData({ focused: true })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    await document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(1)
  })

  it('do not select the next value not focused and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: false })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
  })

  it('select the prev value open and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: true })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(2)
  })

  it('do not select the prev value not focused and hitting ARROW UP', async () => {
    await wrapper.setData({ focused: false })
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    expect((wrapper.vm as any).selectedIdx).toEqual(0)
  })

  it('submit the selected value when focused and hitting ENTER', async () => {
    await wrapper.setData({ focused: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.create).toEqual([['bar']])
  })

  it('not submit the selected value when not focused and hitting ENTER', async () => {
    await wrapper.setData({ focused: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.create).not.toBeDefined()
  })

  it('submit the selected value when focused and hitting ESCAPE', async () => {
    await wrapper.setData({ focused: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted()?.close).toEqual([[]])
  })

  it('not submit the selected value when not focused and hitting ESCAPE', async () => {
    await wrapper.setData({ focused: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(wrapper.emitted()?.close).not.toBeDefined()
  })
})
