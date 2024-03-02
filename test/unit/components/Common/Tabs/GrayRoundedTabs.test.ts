import { createLocalVue, shallowMount } from '@vue/test-utils'

import GrayRoundedTabs from '@/components/Common/Tabs/GrayRoundedTabs.vue'

const localVue = createLocalVue()

let propsData: {
  tabs: string[]
  currentTab: string
}

describe('when instances is selected', () => {
  beforeEach(() => {
    propsData = { tabs: ['foo', 'bar', 'baz'], currentTab: 'foo' }
  })

  it('matches snapshot', async () => {
    const wrapper = shallowMount(GrayRoundedTabs, { localVue, propsData })
    expect(wrapper).toMatchSnapshot('tab is "foo"')
    await wrapper.setProps({ currentTab: 'bar' })
    expect(wrapper).toMatchSnapshot('tab is "bar"')
  })

  it('switches tabs', async () => {
    const wrapper = shallowMount(GrayRoundedTabs, { localVue, propsData })
    await wrapper.findAll('.tabs__tab').at(1).trigger('click')
    expect(wrapper.emitted()['update:current-tab']).toEqual([['bar']])
  })
})
