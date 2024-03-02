import { createLocalVue, shallowMount } from '@vue/test-utils'

import StageTemplate from '@/components/DatasetSettings/Stage/StageTemplate.vue'

const localVue = createLocalVue()

let slots: {
  body: string
} | {
  header: string
  body: string
} | {
  body: string
  footer: string
} | {
  header: string
  body: string
  footer: string
}

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(StageTemplate, { localVue, slots })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('with header', () => {
  beforeEach(() => {
    slots = {
      header: 'Header',
      body: 'Body'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = shallowMount(StageTemplate, { localVue, slots })
    expect(wrapper.text()).toContain('Header')
    expect(wrapper.text()).toContain('Body')
  })
})

describe('with footer', () => {
  beforeEach(() => {
    slots = {
      body: 'Body',
      footer: 'Footer'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = shallowMount(StageTemplate, { localVue, slots })
    expect(wrapper.text()).toContain('Body')
    expect(wrapper.text()).toContain('Footer')
  })
})

describe('with header and footer', () => {
  beforeEach(() => {
    slots = {
      header: 'Header',
      body: 'Body',
      footer: 'Footer'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = shallowMount(StageTemplate, { localVue, slots })
    expect(wrapper.text()).toContain('Header')
    expect(wrapper.text()).toContain('Body')
    expect(wrapper.text()).toContain('Footer')
  })
})

describe('without header and footer', () => {
  beforeEach(() => {
    slots = {
      body: 'Body'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = shallowMount(StageTemplate, { localVue, slots })
    expect(wrapper.text()).toContain('Body')
  })
})
