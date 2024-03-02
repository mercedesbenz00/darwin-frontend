import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, createFile } from 'test/unit/factories'

import { DatasetPayload } from '@/store/types'

import DroppedFiles from './DroppedFiles.vue'

let store: ReturnType<typeof createTestStore>

const localVue = createLocalVue()
localVue.use(Vuex)

const dataset = buildDatasetPayload()

let propsData: {
  dataset: DatasetPayload
  hideTags?: boolean
  hideFolder?: boolean
}

let files: File[]

beforeEach(() => {
  store = createTestStore()
  files = [
    createFile('foo.png'),
    createFile('bar.png'),
    createFile('baz.png'),
    createFile('bat.png')
  ]
  propsData = {
    dataset
  }
})

it('matches snapshot with no files', () => {
  const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with 1 set of files', () => {
  store.commit('datasetUpload/ADD_FILES', files.slice(0, 2))
  const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with multiple sets of files', () => {
  store.commit('datasetUpload/ADD_FILES', files.slice(0, 2))
  store.commit('datasetUpload/ADD_FILES', files.slice(2, 4))
  const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('onRemoveSet', () => {
  it('dispatches to remove set from store', async () => {
    const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
    store.commit('datasetUpload/ADD_FILES', files.slice(0, 2))
    store.commit('datasetUpload/ADD_FILES', files.slice(2, 4))

    await wrapper.vm.$nextTick()

    const uploadSet1 = store.state.datasetUpload.files.slice(0, 2)

    expect(wrapper.findAll('fileset-stub').length).toEqual(2)
    await wrapper.findAll('fileset-stub').at(0).vm.$emit('remove-set')

    expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/removeFiles', uploadSet1)
    await wrapper.findAll('fileset-stub').at(0).vm.$emit('remove-set')

    await flushPromises()
    expect(wrapper.emitted()['files-removed']![0]).toEqual([uploadSet1])
  })
})

describe('onSetFolder', () => {
  it('dispatches path updates to store', async () => {
    const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
    store.commit('datasetUpload/ADD_FILES', files)
    await wrapper.vm.$nextTick()
    await wrapper.findAll('fileset-stub').at(0).vm.$emit('set-folder', '/root')

    const uploadFiles = store.state.datasetUpload.files
    expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/updateFiles', {
      files: uploadFiles,
      data: { path: '/root' }
    })
    await flushPromises()

    expect(wrapper.emitted()['files-updated']).toEqual([[uploadFiles]])
  })
})

describe('onSetTags', () => {
  it('dispatches tags updates to store', async () => {
    const wrapper = shallowMount(DroppedFiles, { localVue, propsData, store })
    store.commit('datasetUpload/ADD_FILES', files)
    await wrapper.vm.$nextTick()
    await wrapper.findAll('fileset-stub').at(0).vm.$emit('set-tags', ['tag1', 'tag2'])

    const uploadFiles = store.state.datasetUpload.files
    expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/updateFiles', {
      files: uploadFiles,
      data: { tags: ['tag1', 'tag2'] }
    })
    await flushPromises()

    expect(wrapper.emitted()['files-updated']).toEqual([[uploadFiles]])
  })
})
