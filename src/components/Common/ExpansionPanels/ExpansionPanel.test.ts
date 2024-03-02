import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'

import ExpansionPanel from './ExpansionPanel.vue'

const localVue = createLocalVue()
localVue.component('ExpansionPanel', ExpansionPanel)

it('matches snapshot with content', () => {
  const wrapper = shallowMount(ExpansionPanel, {
    localVue,
    propsData: {
      id: '1'
    },
    provide: {
      __reactiveInject__: {
        Parent: {
          active: {}
        }
      }
    },
    slots: {
      content: 'Test Content'
    }
  })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with active content', async () => {
  const wrapper = shallowMount(ExpansionPanel, {
    localVue,
    propsData: {
      id: '1',
      activeByDefault: true
    },
    provide: {
      __reactiveInject__: {
        Parent: {
          active: {}
        }
      }
    },
    slots: {
      content: 'Test Content'
    }
  })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})
