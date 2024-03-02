import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassImagePayload,
  buildAxiosResponse,
  buildErrorWithMessage,
  buildTeamPayload,
  buildTeamUploadInfoPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import ClassThumbnail from '@/components/Classes/AnnotationClassDialog/ClassThumbnail.vue'
import { PendingClassImage } from '@/components/Classes/AnnotationClassDialog/types'
import { 
  createClassImageUploadInfo
} from '@/store/modules/aclass/actions/createClassImageUploadInfo'
import {
  StoreActionPayload,
  StoreActionResponse,
  TeamPayload
} from '@/store/types'
import { api, errorsByCode, ErrorWithMessage } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  image: PendingClassImage
  team: TeamPayload
  selected?: boolean
}
let store: ReturnType<typeof createTestStore>

const v7 = buildTeamPayload({ id: 1 })
const validImage = buildAnnotationClassImagePayload({
  id: 'foo',
  index: 0,
  crop_url: 'crop.png',
  original_image_url: 'original.png'
})

mockApi()

beforeEach(() => {
  propsData = {
    image: { id: '1', index: 2 },
    team: v7
  }
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with original_image_url', () => {
  propsData.image.original_image_url = 'original.png'
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with crop_url', () => {
  propsData.image.crop_url = 'cropped.png'
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when selected', () => {
  propsData.selected = true
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits select when image is selected', async () => {
  propsData.image = validImage
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  await wrapper.find('.class-thumbnail__img').trigger('click')
  expect(wrapper.emitted().select).toEqual([[validImage]])
})

it('emits image with image_width and image_height when image loaded', async () => {
  propsData.image = {
    ...validImage,
    image_width: 0,
    image_height: 0
  }
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  const thumbnailImage = wrapper.find('.class-thumbnail__img')
  const thumbnailImageElement = thumbnailImage.element as HTMLImageElement
  jest.spyOn(thumbnailImageElement, 'naturalWidth', 'get').mockReturnValue(100)
  jest.spyOn(thumbnailImageElement, 'naturalHeight', 'get').mockReturnValue(200)
  await thumbnailImage.trigger('load')
  expect(wrapper.emitted().update).toEqual([[{
    ...validImage,
    image_width: 100,
    image_height: 200
  }]])
})

it('removes image information', async () => {
  propsData.image = validImage
  const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
  await wrapper.find('.class-thumbnail__remove').trigger('click')
  expect(wrapper.emitted().update).toEqual([[{
    id: validImage.id,
    index: validImage.index
  }]])
})

describe('drop-area', () => {
  let imageFile: File

  beforeEach(() => {
    imageFile = new File([''], 'thumb.png', { type: 'image/png' })
  })

  it('should add file to this class', async () => {
    const uploadInfo = buildTeamUploadInfoPayload()
    store.dispatch = jest.fn().mockImplementation(async (action) => {
      if (action === 'aclass/createClassImageUploadInfo') {
        const response: StoreActionResponse<typeof createClassImageUploadInfo> = {
          data: uploadInfo
        }

        return await Promise.resolve(response)
      }
      return await Promise.resolve({})
    })
    jest.spyOn(api, 'uploadToS3').mockResolvedValue(buildAxiosResponse({ status: 200 }))

    const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
    await wrapper.find('drop-area-stub').vm.$emit('file-added', imageFile)
    const payload: StoreActionPayload<typeof createClassImageUploadInfo> = {
      team: v7,
      type: 'annotation_class'
    }
    expect(store.dispatch)
      .toHaveBeenCalledWith('aclass/createClassImageUploadInfo', payload)
    await flushPromises()
    expect(api.uploadToS3)
      .toHaveBeenCalledWith(uploadInfo.upload_url, imageFile, 'image/*')
    await flushPromises()
    expect(wrapper.emitted().update).toEqual([[{
      id: uploadInfo.id,
      index: 2,
      key: uploadInfo.key,
      original_image_url: uploadInfo.url
    } as PendingClassImage]])
  })

  it('should toast error when aclass/createClassImageUploadInfo fails', async () => {
    const error: ErrorWithMessage = buildErrorWithMessage()
    store.dispatch = jest.fn().mockImplementation(async (action) => {
      if (action === 'aclass/createClassImageUploadInfo') {
        const response: StoreActionResponse<typeof createClassImageUploadInfo> = {
          error
        }

        return await Promise.resolve(response)
      }
      return await Promise.resolve({})
    })
    const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
    await wrapper.find('drop-area-stub').vm.$emit('file-added', imageFile)
    const payload: StoreActionPayload<typeof createClassImageUploadInfo> = {
      team: v7,
      type: 'annotation_class'
    }
    expect(store.dispatch)
      .toHaveBeenCalledWith('aclass/createClassImageUploadInfo', payload)
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
      content: error.message
    })
    expect(api.uploadToS3).not.toHaveBeenCalled()
    expect(wrapper.emitted().update).toBeUndefined()
  })

  it('should toast error when image upload fails', async () => {
    const uploadInfo = buildTeamUploadInfoPayload()
    store.dispatch = jest.fn().mockImplementation(async (action) => {
      if (action === 'aclass/createClassImageUploadInfo') {
        const response: StoreActionResponse<typeof createClassImageUploadInfo> = {
          data: uploadInfo
        }
        return await Promise.resolve(response)
      }
      return await Promise.resolve({})
    })
    jest.spyOn(api, 'uploadToS3').mockResolvedValue(buildAxiosResponse({ status: 400 }))

    const wrapper = shallowMount(ClassThumbnail, { localVue, propsData, store })
    await wrapper.find('drop-area-stub').vm.$emit('file-added', imageFile)
    const payload: StoreActionPayload<typeof createClassImageUploadInfo> = {
      team: v7,
      type: 'annotation_class'
    }
    expect(store.dispatch)
      .toHaveBeenCalledWith('aclass/createClassImageUploadInfo', payload)
    await flushPromises()
    expect(api.uploadToS3)
      .toHaveBeenCalledWith(uploadInfo.upload_url, imageFile, 'image/*')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
      content: errorsByCode.ANNOTATION_CLASS_THUMBNAIL_UPLOAD_FAILED
    })
    expect(wrapper.emitted().update).toBeUndefined()
  })
})
