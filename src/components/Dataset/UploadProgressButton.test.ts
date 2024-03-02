import { createLocalVue, shallowMount } from '@vue/test-utils'
import { v4 as uuidv4 } from 'uuid'
import Vuex, { Store } from 'vuex'

import { emitRootStub } from 'test/unit/testHelpers'

import UploadProgressButton from '@/components/Dataset/UploadProgressButton.vue'
import { installCommonComponents } from '@/plugins/components'
import { installVueToasted } from '@/plugins/vue-toasted'
import datasetUpload, { getInitialState as datasetUploadState } from '@/store/modules/datasetUpload'
import { UploadFile, UploadFileData } from '@/store/modules/datasetUpload/types'
import { RootState } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)
installVueToasted(localVue)

const newStore = (): Store<RootState> => {
  const store = new Vuex.Store<RootState>({
    modules: {
      datasetUpload: { ...datasetUpload, state: datasetUploadState() }
    }
  })

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const createFile = (name?: string): File => new File([''], name || uuidv4(), { type: 'image/png' })

let store: ReturnType<typeof newStore>
let uploadFile: UploadFile

beforeEach(() => {
  jest.useFakeTimers()

  store = newStore()
  store.commit('datasetUpload/ADD_FILES', [createFile()])
  uploadFile = store.state.datasetUpload.files[0]
  const data: Partial<UploadFileData> = { totalBytes: 100 }
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data })
  store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
})

it('matches snapshot', () => {
  const wrapper = shallowMount(UploadProgressButton, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('shows upload progress', async () => {
  const wrapper = shallowMount(UploadProgressButton, { localVue, store })
  expect(wrapper.text()).toContain('0%')

  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 33 } })
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('33%')

  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 67 } })
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('67%')

  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })
  await wrapper.vm.$nextTick()
  expect(wrapper.text()).toContain('100%')
})

it('resets to normal button 5 secs after dismissable becomes true', async () => {
  const propsData = { dismissable: true }
  const wrapper = shallowMount(UploadProgressButton, { localVue, store, propsData })
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })
  await wrapper.vm.$nextTick()
  jest.advanceTimersByTime(5000)

  expect(store.state.datasetUpload.status).toEqual('stopped')
  expect(store.state.datasetUpload.files).toEqual([])
  expect(store.state.datasetUpload.path).toEqual('')
  expect(store.state.datasetUpload.datasetId).toEqual(null)
  expect(store.state.datasetUpload.tagClasses).toEqual([])
  expect(store.state.datasetUpload.tags).toEqual([])
})

it('goes back to button 5 seconds after the upload is finished', async () => {
  const propsData = { dismissable: false }
  const wrapper = shallowMount(UploadProgressButton, { localVue, store, propsData })
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })
  await wrapper.vm.$nextTick()

  jest.advanceTimersByTime(5000)
  expect(store.state.datasetUpload.files).toEqual([uploadFile])
})

it('resets timeout in beforeDestroy', async () => {
  // jest thinks window.setTimeout returns a NodeJS.Timeout.
  // we just care clearTimeout is called with the same value, so overall, it does not matter
  jest.spyOn(window, 'setTimeout').mockImplementation(() => -5 as unknown as NodeJS.Timeout)
  jest.spyOn(window, 'clearTimeout')
  const propsData = { dismissable: true }
  const wrapper = shallowMount(UploadProgressButton, { localVue, store, propsData })
  store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })
  await wrapper.vm.$nextTick()

  wrapper.destroy()

  expect(window.clearTimeout).toHaveBeenCalledWith(-5)
})

describe('click', () => {
  it('clears completed upload if progress is 100% and dismissable is true', async () => {
    const propsData = { dismissable: true }
    const wrapper = shallowMount(UploadProgressButton, { localVue, store, propsData })
    store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })
    await wrapper.vm.$nextTick()
    await emitRootStub(wrapper, 'click')

    expect(store.state.datasetUpload.status).toEqual('stopped')
    expect(store.state.datasetUpload.files).toEqual([])
    expect(store.state.datasetUpload.path).toEqual('')
    expect(store.state.datasetUpload.datasetId).toEqual(null)
    expect(store.state.datasetUpload.tagClasses).toEqual([])
    expect(store.state.datasetUpload.tags).toEqual([])
  })

  it('does nothing if dismissable is false', async () => {
    const propsData = { dismissable: false }
    const wrapper = shallowMount(UploadProgressButton, { localVue, store, propsData })
    store.commit('datasetUpload/SET_FILE_DATA', { uploadFile, data: { sentBytes: 100 } })

    await emitRootStub(wrapper, 'click')

    expect(store.state.datasetUpload.status).toEqual('started')
    expect(store.state.datasetUpload.files).toEqual([uploadFile])
  })

  it('dispatches toast if dismissable and progress not 100%', async () => {
    const propsData = { dismissable: true }
    const $toast = { info: jest.fn()}
    const wrapper = shallowMount(UploadProgressButton, {
      localVue,
      store,
      propsData,
      mocks: { $toast }
    })

    await emitRootStub(wrapper, 'click')
    expect(store.state.datasetUpload.status).toEqual('started')
    expect(store.state.datasetUpload.files).toEqual([uploadFile])

    expect($toast.info).toHaveBeenCalledWith({
      meta: {
        title: 'Images are being uploaded at the moment'
      }
    })
  })
})
