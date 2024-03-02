import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { 
  buildAnnotationClassImagePayload, 
  buildAxiosResponse, 
  buildTeamPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import ClassThumbnails from '@/components/Classes/AnnotationClassDialog/ClassThumbnails.vue'
import { PendingClassImage } from '@/components/Classes/AnnotationClassDialog/types'
import { TeamPayload } from '@/store/types'
import * as api from '@/utils/api'

const localVue = createLocalVue()
localVue.use(Vuex)
let propsData: {
  classColor: string
  className: string
  images: PendingClassImage[]
  team: TeamPayload
}

let store: ReturnType<typeof createTestStore>

mockApi()

beforeEach(() => {
  store = createTestStore()
  propsData = {
    classColor: 'rgba(0,0,0,0)',
    className: 'My Class',
    images: [
      buildAnnotationClassImagePayload({ id: 'foo', index: 0 }),
      buildAnnotationClassImagePayload({ id: 'bar', index: 1 }),
      buildAnnotationClassImagePayload({ id: 'baz', index: 2 })
    ],
    team: buildTeamPayload({ id: 7 })
  }
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get cropper () {
    const wrapper = this.wrapper.find('thumbnail-cropper-stub')
    return {
      wrapper,
      update: (image: PendingClassImage) => wrapper.vm.$emit('update', image),
      crop: (image: PendingClassImage, data: string) => wrapper.vm.$emit('crop', image, data)
    }
  }

  get thumbnails () {
    return this.wrapper.findAll('class-thumbnail-stub').wrappers.map(wrapper => ({
      wrapper,
      update: (image: PendingClassImage) => wrapper.vm.$emit('update', image),
      select: (image: PendingClassImage) => wrapper.vm.$emit('select', image)
    }))
  }
}

it('matches snapshot', async () => {
  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('updates images when a single image has been uploaded', async () => {
  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  const model = new Model(wrapper)

  const updated = { ...propsData.images[1], original_image_url: 'foo' }
  await model.thumbnails[1].update(updated)
  expect(wrapper.emitted()['update:images']![0][0]).toEqual([
    propsData.images[0],
    updated,
    propsData.images[2]
  ])
})

it('sets new selected image when a single one has been selected', async () => {
  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  const model = new Model(wrapper)

  await wrapper.vm.$nextTick()
  expect(wrapper.vm.$data.selectedImageId).toEqual(propsData.images[0].id)

  await model.thumbnails[1].select(propsData.images[1])
  expect(wrapper.vm.$data.selectedImageId).toEqual(propsData.images[1].id)
})

it('updates images when a new crop has been set', async () => {
  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  const model = new Model(wrapper)
  await wrapper.vm.$nextTick()

  const cropped = { ...propsData.images[0], x: 50, y: 70, scale: 25 }
  await model.cropper.update(cropped)
  expect(wrapper.emitted()['update:images']![0][0]).toEqual([
    cropped,
    propsData.images[1],
    propsData.images[2]
  ])
})

it('uploads to s3 and updates images when new crop data is received', async () => {
  jest.spyOn(api, 'uploadToS3').mockResolvedValue(buildAxiosResponse({ status: 200 }))
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: { id: 'fake-id', key: 'foo', url: 'bar', upload_url: 'baz' }
  })

  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  const model = new Model(wrapper)
  await flushPromises()

  const cropped = { ...propsData.images[0], id: 'fake-id', crop_key: 'foo', crop_url: 'bar' }

  await model.cropper.crop(cropped, 'fakeblob')
  await flushPromises()

  expect(api.uploadToS3).toHaveBeenCalledWith('baz', 'fakeblob', 'image/*')
  expect(wrapper.emitted()['update:images']![0][0]).toEqual([
    cropped,
    propsData.images[1],
    propsData.images[2]
  ])
})

it('renders error if failing to get upload url from backend', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'backend failed' } })

  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  await wrapper.vm.$nextTick()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'backend failed' })
})

it('renders error if failing to upload to s3', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: { id: 'fake-id', key: 'foo', url: 'bar' }
  })
  jest.spyOn(api, 'uploadToS3').mockResolvedValue(buildAxiosResponse({ status: 403 }))

  const wrapper = shallowMount(ClassThumbnails, { localVue, propsData, store })
  const model = new Model(wrapper)
  await flushPromises()

  const cropped = { ...propsData.images[0], id: 'fake-id', crop_key: 'foo', crop_url: 'bar' }
  await model.cropper.crop(cropped, 'fakeblob')
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', {
    content: 'There was some trouble uploading your image. Please try again'
  })
})
