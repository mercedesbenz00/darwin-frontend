import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import WorkflowTitle from '@/components/Workflow/WorkflowTitle.vue'

const localVue = createLocalVue()

type WorkflowTitleProp = {
  loading?: Boolean
}

let propsData: WorkflowTitleProp

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowTitle, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when not loading', () => {
  let wrapper: Wrapper<Vue>

  itMatchesSnapshot()

  beforeEach(() => {
    propsData = { loading: false }
    wrapper = shallowMount(WorkflowTitle, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should have h1 html tag containing Workflow', (): void => {
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Workflows')
  })

  it('should have a button', (): void => {
    expect(wrapper.find('custom-button-stub').exists()).toBe(true)
  })

  it('should have a \'Create workflow\' button', (): void => {
    expect(wrapper.find('custom-button-stub').text()).toBe('Create Workflow')
  })

  it('should have an enabled button', (): void => {
    const disabled = wrapper.find('custom-button-stub').attributes().disabled
    expect(disabled === 'false' || disabled === undefined).toBe(true)
  })
})

describe('when loading', () => {
  let wrapper: Wrapper<Vue>

  itMatchesSnapshot()

  beforeEach(() => {
    propsData = { loading: true }
    wrapper = shallowMount(WorkflowTitle, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should have a button', (): void => {
    expect(wrapper.find('custom-button-stub').exists()).toBe(true)
  })

  it('should have a disabled button', (): void => {
    expect(wrapper.find('custom-button-stub').attributes().disabled).toBe('true')
  })
})

describe('when used search slot', () => {
  let wrapperSlotted: Wrapper<Vue, Element>

  itMatchesSnapshot()

  beforeEach(() => {
    wrapperSlotted = shallowMount(WorkflowTitle, {
      localVue,
      propsData,
      slots: {
        search: { template: '<div id="search" />' }
      }
    })
  })

  afterEach(() => {
    wrapperSlotted.destroy()
  })

  it('should have a div within its filter slot', () => {
    expect(wrapperSlotted.find('#search').exists()).toBe(true)
  })
})

describe('when used sort slot', () => {
  let wrapperSlotted: Wrapper<Vue, Element>

  beforeEach(() => {
    wrapperSlotted = shallowMount(WorkflowTitle, {
      localVue,
      propsData,
      slots: {
        sort: { template: '<div id="sort" />' }
      }
    })
  })

  afterEach(() => {
    wrapperSlotted.destroy()
  })

  itMatchesSnapshot()

  it('should have a div within its sort slot', () => {
    expect(wrapperSlotted.find('#sort').exists()).toBe(true)
  })
})
