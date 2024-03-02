import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import Toggle from './Toggle.vue'
import { TogglePosition, ToggleSize } from './types'

const localVue = createLocalVue()

const itMatchesSnapshot =
  ({ propsData, slots }: { propsData?: object, slots?: Slots } = {}): void => {
    it('matches snapshot', () => {
      const wrapper = shallowMount(Toggle, { localVue, propsData, slots })

      expect(wrapper).toMatchSnapshot()
    })
  }

describe('by default', () => {
  it(`renders a "${ToggleSize.SMALL}" toggle by default`, () => {
    const wrapper = shallowMount(Toggle, { localVue })

    expect(wrapper.classes()).toContain(`toggle--${ToggleSize.SMALL}`)
  })

  it(`renders a toggle at the "${TogglePosition.START}" by default`, () => {
    const wrapper = shallowMount(Toggle, { localVue })

    expect(wrapper.classes()).toContain(`toggle--${TogglePosition.START}`)
  })

  itMatchesSnapshot()
})

describe(`when size is "${ToggleSize.LARGE}"`, () => {
  const propsData = { size: ToggleSize.LARGE }

  it(`renders a "${ToggleSize.LARGE}" toggle`, () => {
    const wrapper = shallowMount(Toggle, { localVue, propsData })

    expect(wrapper.classes()).toContain(`toggle--${ToggleSize.LARGE}`)
  })

  itMatchesSnapshot({ propsData })
})

describe(`when position is "${TogglePosition.END}"`, () => {
  const propsData = { position: TogglePosition.END }

  it(`renders a toggle at the "${TogglePosition.END}"`, () => {
    const wrapper = shallowMount(Toggle, { localVue, propsData })

    expect(wrapper.classes()).toContain(`toggle--${TogglePosition.END}`)
  })

  itMatchesSnapshot({ propsData })
})

describe('when content for label is provided', () => {
  it('renders the label content', () => {
    const label = '<strong>Hello world!</strong>'
    const slots = { default: label }
    const wrapper = shallowMount(Toggle, { localVue, slots })

    expect(wrapper.html()).toContain(label)
  })

  itMatchesSnapshot({ slots: { default: 'Test' } })
})

describe('when content for tools is provided', () => {
  it('renders the label content', () => {
    const print = '<button>Print</button>'
    const slots = { tools: print }
    const wrapper = shallowMount(Toggle, { localVue, slots })

    expect(wrapper.html()).toContain(print)
  })

  itMatchesSnapshot({ slots: { tools: '<button>Print</button>' } })
})

describe('when content for both label and tools is provided', () => {
  it('renders the label and tools content', () => {
    const label = '<strong>Hello world!</strong>'
    const print = '<button>Print</button>'
    const slots = { default: label, tools: print }
    const wrapper = shallowMount(Toggle, { localVue, slots })

    const html = wrapper.html()
    expect(html).toContain(label)
    expect(html).toContain(print)
  })

  itMatchesSnapshot({ slots: { default: 'Test', tools: '<button>Print</button>' } })
})
