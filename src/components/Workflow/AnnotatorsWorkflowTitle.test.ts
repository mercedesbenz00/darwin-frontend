import { createLocalVue, shallowMount } from '@vue/test-utils'

import AnnotatorsWorkflowTitle from '@/components/Workflow/AnnotatorsWorkflowTitle.vue'

const localVue = createLocalVue()

type Props = {
  loading: boolean
  count?: number
}

const itMatchesSnapshot = (propsData: Props): void => it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotatorsWorkflowTitle, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

describe('when loading', () => {
  const propsData = { loading: true }

  itMatchesSnapshot(propsData)

  it('renders a loading message', () => {
    const wrapper = shallowMount(AnnotatorsWorkflowTitle, { localVue, propsData })
    expect(wrapper.text()).toBe('Loading Workflows...')
  })
})

describe('when not loading and count is 0', () => {
  const propsData = { loading: false, count: 0 }

  itMatchesSnapshot(propsData)

  it('renders the no workflows message', (): void => {
    const wrapper = shallowMount(AnnotatorsWorkflowTitle, { localVue, propsData })
    expect(wrapper.text()).toBe('You have no assigned Workflows')
  })
})

describe('when not loading and count is 1', () => {
  const propsData = { loading: false, count: 1 }

  itMatchesSnapshot(propsData)

  it('renders a non-pluralized message', (): void => {
    const wrapper = shallowMount(AnnotatorsWorkflowTitle, { localVue, propsData })
    expect(wrapper.text()).toBe('You have 1 assigned Workflow')
  })
})

describe('when not loading and count is greater than 1', () => {
  const propsData = { loading: false, count: 2 }

  itMatchesSnapshot(propsData)

  it('renders a pluralized message', (): void => {
    const wrapper = shallowMount(AnnotatorsWorkflowTitle, { localVue, propsData })
    expect(wrapper.text()).toBe('You have 2 assigned Workflows')
  })
})
