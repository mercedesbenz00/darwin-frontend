import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildUploadImage, buildUploadVideo } from 'test/unit/factories'

import FileSetInfo from '@/components/Dataset/DropZone/FileSet/FileSetInfo.vue'
import { UploadFileSet } from '@/components/Dataset/DropZone/types'
import { UploadImage, UploadVideo } from '@/store/modules/datasetUpload/types'
import { pluralize } from '@/utils/pluralize'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.filter('pluralize', pluralize)

const mocks = {
  $theme: createMockTheme()
}
let store: ReturnType<typeof createTestStore>
let imageUpload: UploadImage
let videoUpload: UploadVideo
let propsData: {
  set: UploadFileSet
}
let slots: Slots

beforeEach(() => {
  store = createTestStore()
  imageUpload = buildUploadImage()
  videoUpload = buildUploadVideo()
  propsData = {
    set: {
      id: 1,
      files: [imageUpload, videoUpload]
    }
  }
  slots = {
    actions: {
      template: '<div>actions slot</div>'
    }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSetInfo, { localVue, mocks, propsData, slots, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with one file', () => {
  imageUpload.data.sentBytes = 30
  imageUpload.data.totalBytes = 100
  propsData.set.files = [imageUpload]
  const wrapper = shallowMount(FileSetInfo, { localVue, mocks, propsData, slots, store })
  expect(wrapper).toMatchSnapshot()
})
