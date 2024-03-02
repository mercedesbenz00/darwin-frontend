import { createLocalVue, shallowMount } from '@vue/test-utils'

import InstructionsSidebar from '@/components/WorkView/Instructions/InstructionsSidebar.vue'

const localVue = createLocalVue()

const mocks = { $ga: { event: () => {} } }
let propsData: { open: boolean }
const slots = { default: 'Image Manipulation sidebar content slot' }

beforeEach(() => {
  propsData = { open: false }
})

it('renders the sidebar', () => {
  const wrapper = shallowMount(InstructionsSidebar, { localVue, mocks, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits open when the sidebar is opened', async () => {
  const wrapper = shallowMount(InstructionsSidebar, { localVue, mocks, propsData, slots })
  await wrapper.find('button.instructions-sidebar__button--open').trigger('click')

  expect(wrapper.emitted()['update:open']).toEqual([[true]])
  expect(wrapper.emitted().opened).toBeDefined()
})

it('emits close when the sidebar is closed', async () => {
  const wrapper = shallowMount(InstructionsSidebar, { localVue, mocks, propsData, slots })
  await wrapper.find('.instructions-sidebar__button--open').trigger('click')
  await wrapper.find('.instructions-sidebar__button--close').trigger('click')

  expect(wrapper.emitted()['update:open']).toBeDefined()
  expect(wrapper.emitted()['update:open']![1]).toEqual([false])
  expect(wrapper.emitted().closed).toBeDefined()
})
