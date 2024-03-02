import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, buildUploadImage, buildUploadVideo } from 'test/unit/factories'

import FileSet from '@/components/Dataset/DropZone/FileSet/FileSet.vue'
import { UploadFileSet } from '@/components/Dataset/DropZone/types'
import { UploadImage, UploadVideo } from '@/store/modules/datasetUpload/types'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let propsData: {
  set: UploadFileSet
  dataset: DatasetPayload
  hideTags?: boolean
  hideFolder?: boolean
}
let imageUpload: UploadImage
let videoUpload: UploadVideo
const dataset = buildDatasetPayload()
const stubs: Stubs = {
  FileSetInfo: {
    template: `<div class="file-set-info">
      <slot name="actions"/>
    </div>`
  }
}

beforeEach(() => {
  store = createTestStore()
  imageUpload = buildUploadImage()
  videoUpload = buildUploadVideo()
  propsData = {
    set: {
      id: 1,
      files: [imageUpload, videoUpload]
    },
    dataset
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when tags are hidden', () => {
  propsData.hideTags = true
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when folder is hidden', () => {
  propsData.hideFolder = true
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with thumbnails', () => {
  imageUpload.data.dataURL = 'image-thumbnail'
  videoUpload.data.thumbs = ['video-thumbnail']
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('should load thumbnail information when mounted', () => {
  shallowMount(FileSet, { localVue, propsData, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/getVideoInfo', videoUpload)
  expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/getFileContent', imageUpload)
})

it('should emit "remove-set" when delete button is clicked', async () => {
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  await wrapper.find('file-set-delete-button-stub').vm.$emit('click')
  expect(wrapper.emitted()['remove-set']).toBeDefined()
})

it('should emit "set-tags" when tags are selected', async () => {
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  await wrapper.find('file-set-tag-button-stub').vm.$emit('set-tags', ['tag1', 'tag2'])
  expect(wrapper.emitted()['set-tags']).toEqual([[['tag1', 'tag2']]])
})

it('should emit "set-folder" when folder is selected', async () => {
  const wrapper = shallowMount(FileSet, { localVue, propsData, store, stubs })
  await wrapper.find('file-set-folder-button-stub').vm.$emit('set-folder', '/root')
  expect(wrapper.emitted()['set-folder']).toEqual([['/root']])
})
