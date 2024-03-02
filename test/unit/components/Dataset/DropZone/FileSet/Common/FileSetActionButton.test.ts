import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import FileSetActionButton from '@/components/Dataset/DropZone/FileSet/Common/FileSetActionButton.vue'

const localVue = createLocalVue()
let slots: Slots = {}

beforeEach(() => {
  slots = {}
})

it('matches snapshot without slots', () => {
  const wrapper = shallowMount(FileSetActionButton, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with slots', () => {
  slots = {
    default: 'Default slot'
  }
  const wrapper = shallowMount(FileSetActionButton, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})
