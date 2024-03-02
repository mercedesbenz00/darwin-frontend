import { createLocalVue, shallowMount } from '@vue/test-utils'

import { triggerRootStub } from 'test/unit/testHelpers'

import FileSetDeleteButton from '@/components/Dataset/DropZone/FileSet/FileSetDeleteButton.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSetDeleteButton, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('should emit click when button clicked', async () => {
  const wrapper = shallowMount(FileSetDeleteButton, { localVue })
  await triggerRootStub(wrapper, 'click')
  expect(wrapper.emitted().click).toBeDefined()
})
