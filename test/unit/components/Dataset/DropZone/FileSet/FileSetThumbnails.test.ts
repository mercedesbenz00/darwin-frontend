import { createLocalVue, shallowMount } from '@vue/test-utils'

import FileSetThumbnails from '@/components/Dataset/DropZone/FileSet/FileSetThumbnails.vue'

const localVue = createLocalVue()
let propsData: {
  thumbnails: string[]
}

beforeEach(() => {
  propsData = {
    thumbnails: ['1.jpg', '2.jpg']
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSetThumbnails, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with no thumbnails', () => {
  propsData.thumbnails = []
  const wrapper = shallowMount(FileSetThumbnails, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
