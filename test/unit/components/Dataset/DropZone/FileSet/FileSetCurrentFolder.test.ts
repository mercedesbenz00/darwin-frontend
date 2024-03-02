import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildUploadImage } from 'test/unit/factories'

import FileSetCurrentFolder from '@/components/Dataset/DropZone/FileSet/FileSetCurrentFolder.vue'
import { UploadFileSet } from '@/components/Dataset/DropZone/types'
import { UploadImage } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
let imageUpload: UploadImage
let propsData: {
  set: UploadFileSet
}

beforeEach(() => {
  imageUpload = buildUploadImage()
  propsData = {
    set: {
      id: 1,
      files: [imageUpload]
    }
  }
})

it('matches snapshot when path is defined', () => {
  imageUpload.data.path = '/root'
  const wrapper = shallowMount(FileSetCurrentFolder, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when path is not defined', () => {
  const wrapper = shallowMount(FileSetCurrentFolder, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
