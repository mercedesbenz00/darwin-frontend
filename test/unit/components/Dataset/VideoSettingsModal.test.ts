import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import VideoSettingsModal from '@/components/Dataset/VideoSettingsModal.vue'
import { installCommonComponents } from '@/plugins/components'
import { UploadFile, UploadVideo } from '@/store/modules/datasetUpload/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let uploadFile: UploadVideo
let propsData: { uploadFile: UploadFile }
const mocks = {
  $featureEnabled: jest.fn().mockReturnValue(true),
  $theme: createMockTheme()
}

beforeEach(() => {
  store = createTestStore()
  uploadFile = {
    data: {
      category: 'video',
      duration: 3000,
      framerate: 60,
      setId: 1,
      signingURL: 'signing-url',
      status: 'added',
      sentBytes: 0,
      totalBytes: 1000
    },
    file: new File([], 'file.mp4'),
    annotateAsFrames: false
  }
  propsData = { uploadFile }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(VideoSettingsModal, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders right formatted message for the selected framerate', async () => {
  const wrapper = shallowMount(VideoSettingsModal, { localVue, mocks, propsData, store })
  await wrapper.find('slider-stub').vm.$emit('input', '30')
  expect(
    wrapper.find('.video-control__frames-summary').html()
  ).toContain('Extract 30 frames per second, for a total of 1800 images.')
})

it('renders right warning message if it exceeds 2000 images', async () => {
  const wrapper = shallowMount(VideoSettingsModal, { localVue, mocks, propsData, store })
  await wrapper.find('slider-stub').vm.$emit('input', '40')
  expect(wrapper.find('.video-control__warning').exists()).toBeTruthy()
  expect(wrapper.find('.video-control__warning').html()).toContain('exceeds 2,000 frames')
})

it('emits selected framerate', async () => {
  const wrapper = shallowMount(VideoSettingsModal, { localVue, mocks, propsData, store })
  await wrapper.find('slider-stub').vm.$emit('input', '30')
  await wrapper.find('positive-button-stub').vm.$emit('click')
  expect(wrapper.emitted().start).toEqual([[{
    uploadFile,
    framerate: 30,
    annotateAsFrames: false
  }]])
})

it('emits "native" as framerate when native frame rate checkbox is clicked', async () => {
  const wrapper = shallowMount(VideoSettingsModal, { localVue, mocks, propsData, store })
  await wrapper.find('check-box-stub[name="native"]').vm.$emit('input', true)
  await wrapper.find('positive-button-stub').vm.$emit('click')
  expect(wrapper.emitted().start).toEqual([[{
    uploadFile,
    framerate: 'native',
    annotateAsFrames: false
  }]])
})
