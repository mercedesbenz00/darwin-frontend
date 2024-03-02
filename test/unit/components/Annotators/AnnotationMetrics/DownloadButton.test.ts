import { shallowMount, createLocalVue } from '@vue/test-utils'

import DownloadButton from '@/components/Annotators/AnnotationMetrics/DownloadButton.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})

let propsData: { disabled?: boolean }

describe('when enabled', () => {
  beforeEach(() => {
    propsData = {}
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DownloadButton, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('emits click', () => {
    const wrapper = shallowMount(DownloadButton, { localVue, propsData })
    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().click).toHaveLength(1)
  })
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData = { disabled: true }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DownloadButton, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('never emits click', () => {
    const wrapper = shallowMount(DownloadButton, { localVue, propsData })
    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().click).toBeUndefined()
  })
})
