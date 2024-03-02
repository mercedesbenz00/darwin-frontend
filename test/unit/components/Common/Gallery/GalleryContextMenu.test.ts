import { createLocalVue, shallowMount } from '@vue/test-utils'

import GalleryContextMenu from '@/components/Common/Gallery/GalleryContextMenu.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(GalleryContextMenu, { localVue })
  expect(wrapper).toMatchSnapshot()
})
