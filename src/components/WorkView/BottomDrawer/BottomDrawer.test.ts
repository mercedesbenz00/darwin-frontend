import { createLocalVue, shallowMount } from '@vue/test-utils'

import { BottomDrawer } from '@/components/WorkView/BottomDrawer'

const localVue = createLocalVue()

jest.mock('@/composables/useTheme')
jest.mock('@/composables/useGA')

it('matches snapshot with default props', () => {
  const wrapper = shallowMount(BottomDrawer, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when not resizable', () => {
  const propsData = { resizable: true }
  const wrapper = shallowMount(BottomDrawer, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits toggle when the button is clicked', async () => {
  const wrapper = shallowMount(BottomDrawer, { localVue, propsData: {} })
  const button = wrapper.find('bottom-drawer-toggle-button-stub')
  await button.vm.$emit('click')
  const toggle = wrapper.emitted('toggle')
  // for some reason, asserting equality of the params for toggle throws a vue 
  // warning related to nodeType not being defined, so we do it step by step 
  // like this
  expect(toggle).toBeDefined()
  expect(toggle!.length).toEqual(1)
  expect(toggle![0][0]).toEqual(true)
})
