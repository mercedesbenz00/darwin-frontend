import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  id: 'random-uuid',
  text: 'List-Element',
  selected: false
}

beforeEach(() => {
  wrapper = shallowMount(ListElementV2, {
    propsData,
    slots: {
      prefix: '<div />',
      suffix: '<div />'
    }
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('List Element V2 UI', () => {
  it('should mount correctly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display the correct text', () => {
    expect(wrapper.find('.list-element__content__label').text()).toContain(propsData.text)
  })

  it('should be selected and apply styles', async () => {
    await wrapper.setProps({
      id: 'random-uuid',
      text: 'List-Element',
      selected: true
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes()['data-selected']).toBeTruthy()
  })
})
