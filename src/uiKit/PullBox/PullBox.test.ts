import { createLocalVue, shallowMount } from '@vue/test-utils'

import PullBox from './PullBox.vue'

const scrollableTemplate = `
  <div class="scroll" style="overflow: auto; height: 200px;">
    <div style="height: 2000px;"></div>
  </div>
`
const localVue = createLocalVue()

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, value: 2000 })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 200 })
})

it('matches snapshot', () => {
  const wrapper = shallowMount(PullBox, {
    localVue,
    slots: {
      default: '<div>Test</div>'
    }
  })
  expect(wrapper).toMatchSnapshot()
})

it('should pull up', async () => {
  const wrapper = shallowMount(PullBox, {
    localVue,
    propsData: {
      up: true,
      pullForce: 1
    },
    slots: {
      default: scrollableTemplate
    }
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, value: 0 })

  await wrapper.find('.box').trigger('wheel', { deltaY: -200 })

  expect(wrapper.emitted().up).toBeDefined()
})

it('should pull down', async () => {
  const wrapper = shallowMount(PullBox, {
    localVue,
    propsData: {
      down: true,
      pullForce: 1
    },
    slots: {
      default: scrollableTemplate
    }
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollTop', { configurable: true, value: 2001 })

  await wrapper.find('.box').trigger('wheel', { deltaY: 200 })

  expect(wrapper.emitted().down).toBeDefined()
})
