import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import ModelButton from '@/components/Models/ModelManagement/ModelButton.vue'

const localVue = createLocalVue()
let propsData: {
  text: string
  hoverText?: string
  time?: string
}

describe('when given text', () => {
  let wrapper: Wrapper<Vue>
  beforeEach(() => {
    propsData = { text: 'some status' }
    wrapper = shallowMount(ModelButton, { localVue, propsData })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when given text and time', () => {
  let wrapper: Wrapper<Vue>
  beforeEach(() => {
    propsData = { text: 'some status', time: '43 minutes ago' }
    wrapper = shallowMount(ModelButton, { localVue, propsData })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when given text and hover text', () => {
  let wrapper: Wrapper<Vue>
  beforeEach(() => {
    propsData = { text: 'some status', hoverText: 'do something' }
    wrapper = shallowMount(ModelButton, { localVue, propsData })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when given text, hover text and time', () => {
  let wrapper: Wrapper<Vue>
  beforeEach(() => {
    propsData = { text: 'some status', hoverText: 'do something', time: '2 days ago' }
    wrapper = shallowMount(ModelButton, { localVue, propsData })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
