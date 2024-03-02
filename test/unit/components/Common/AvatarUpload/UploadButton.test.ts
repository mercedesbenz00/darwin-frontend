import { createLocalVue, shallowMount } from '@vue/test-utils'

import UploadButton from '@/components/Common/AvatarUpload/UploadButton.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(UploadButton, { localVue })
  expect(wrapper).toMatchSnapshot()
})
