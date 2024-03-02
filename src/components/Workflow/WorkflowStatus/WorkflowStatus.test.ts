import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import { WorkflowStatus } from '@/components/Workflow/WorkflowStatus'

const localVue = createLocalVue()

const propsData = {
  variant: 'active',
  dense: false
}

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowStatus, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('is instanciated', () => {
  const wrapper = shallowMount(WorkflowStatus, { localVue, propsData })
  expect(wrapper).toBeTruthy()
})

describe('when value is set', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    wrapper = shallowMount(WorkflowStatus, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  it('should contain a badge with the variant "active"', async () => {
    await wrapper.setProps({ variant: 'active' })
    const badge = wrapper.find('badge-stub')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes().label).toBe('active')
  })

  it('should contain a badge with the variant "offline"', async () => {
    await wrapper.setProps({ variant: 'offline' })
    const badge = wrapper.find('badge-stub')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes().label).toBe('offline')
  })

  it('should contain a badge with the variant "draft"', async () => {
    await wrapper.setProps({ variant: 'draft' })
    const badge = wrapper.find('badge-stub')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes().label).toBe('draft')
  })

  it('should contain a badge with the variant "inactive"', async () => {
    await wrapper.setProps({ variant: 'inactive' })
    const badge = wrapper.find('badge-stub')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes().label).toBe('inactive')
  })
})

describe('when size is small', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    ...propsData,
    dense: true
  }

  beforeEach(() => {
    wrapper = shallowMount(WorkflowStatus, { localVue, propsData: _propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  it('should contain a dense badge', async () => {
    await wrapper.setProps({ size: 'small' })
    const badge = wrapper.find('badge-stub')
    expect(badge.exists()).toBe(true)
    expect(badge.attributes().size).toBe('small')
  })
})
