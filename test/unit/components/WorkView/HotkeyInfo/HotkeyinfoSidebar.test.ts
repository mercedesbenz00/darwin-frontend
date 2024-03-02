import { createLocalVue, shallowMount } from '@vue/test-utils'

import HotkeyInfoSidebar from '@/components/WorkView/HotkeyInfo/HotkeyInfoSidebar.vue'

const localVue = createLocalVue()

const mocks = { $ga: { event: () => {} } }
const slots = { default: 'HotKey Info content slot' }
let propsData: { open: boolean }

beforeEach(() => {
  propsData = { open: false }
})

it('renders the sidebar', () => {
  const wrapper = shallowMount(HotkeyInfoSidebar, { localVue, mocks, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits opened when the sidebar is closed', async () => {
  const wrapper = shallowMount(HotkeyInfoSidebar, { localVue, mocks, propsData, slots })
  await wrapper.find('button.hotkeys-sidebar__button--open').trigger('click')
  expect(wrapper.emitted()['update:open']).toEqual([[true]])
  expect(wrapper.emitted().opened).toBeDefined()
})

it('emits closed when the sidebar is closed', async () => {
  const wrapper = shallowMount(HotkeyInfoSidebar, { localVue, mocks, propsData, slots })
  await wrapper.find('.hotkeys-sidebar__button--open').trigger('click')
  await wrapper.find('.hotkeys-sidebar__button--close').trigger('click')

  expect(wrapper.emitted()['update:open']).toBeDefined()
  expect(wrapper.emitted()['update:open']![1]).toEqual([false])
  expect(wrapper.emitted().closed).toBeDefined()
})
