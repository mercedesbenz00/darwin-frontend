import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload, createFile } from 'test/unit/factories'

import { toUploadFile } from '@/store/modules/datasetUpload/helpers'
import { DatasetPayload } from '@/store/types'

import DropZone from './DropZone.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const dataset: DatasetPayload = buildDatasetPayload()
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

it('matches snapshot', () => {
  const wrapper = shallowMount(DropZone, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with hideTags and hideFolder', () => {
  propsData.hideTags = true
  propsData.hideFolder = true
  const wrapper = shallowMount(DropZone, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with multiple sets added', () => {
  store.commit('datasetUpload/ADD_FILES', files)
  const wrapper = shallowMount(DropZone, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

describe('on DropArea files added', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(async () => {
    store.commit('datasetUpload/ADD_FILES', files)
    wrapper = shallowMount(DropZone, { localVue, propsData, store })

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockRestore()

    jest.spyOn(store, 'dispatch').mockResolvedValue({ data: files.map(f => toUploadFile(f, 5)) })

    await wrapper.find('droparea-stub').vm.$emit('files-added', files)
  })

  it('calls store action to add files', () => {
    expect(store.dispatch).toHaveBeenCalledWith('datasetUpload/addFiles', files)
  })

  it('emits files-added when drop-area emits files-added', async () => {
    await flushPromises()
    expect(wrapper.emitted()['files-added']).toBeDefined()
    expect(wrapper.emitted()['files-added']![0]).toEqual([files.map(f => toUploadFile(f, 5))])
  })
})
