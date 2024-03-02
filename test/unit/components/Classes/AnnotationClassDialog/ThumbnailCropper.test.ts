import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import { buildAnnotationClassImagePayload } from 'test/unit/factories'

import ThumbnailCropper from '@/components/Classes/AnnotationClassDialog/ThumbnailCropper.vue'
import {
  CropInfo,
  Croppie,
  PendingClassImageWithUrlSet
} from '@/components/Classes/AnnotationClassDialog/types'

const localVue = createLocalVue()

let propsData: {
  image: PendingClassImageWithUrlSet
}

const mocks = {
  $theme: createMockTheme()
}

const stubs = { 'vue-croppie': true }

beforeEach(() => {
  propsData = {
    image: buildAnnotationClassImagePayload({ id: 'foo', index: 0 })
  }
})

class Model {
  wrapper: Wrapper<Vue>
  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get component () {
    return this.wrapper.vm as Vue & { $refs: { cropper: Croppie }}
  }

  stubRefs () {
    const cropper: Croppie = {
      bind: jest.fn(),
      setZoom: jest.fn(),
      get: jest.fn(),
      result: jest.fn()
    };
    (this.component.$refs as any).cropper = cropper
  }

  get cropper () {
    const wrapper = this.wrapper.find('vue-croppie-stub')
    return {
      wrapper,
      setCrop: (info: CropInfo) => wrapper.vm.$emit('update', info)
    }
  }

  get slider () {
    const wrapper = this.wrapper.find('slider-stub')
    return {
      wrapper,
      setZoom: (zoom: number) => wrapper.vm.$emit('change', zoom)
    }
  }
}

it('matches snapshot on init and when loaded', async () => {
  const wrapper = shallowMount(ThumbnailCropper, { localVue, mocks, propsData, stubs })
  const model = new Model(wrapper)
  await model.stubRefs()

  expect(wrapper).toMatchSnapshot()

  await wrapper.setData({ imageLoading: false })
  expect(wrapper).toMatchSnapshot()
})

it('allows manipulating crop to get an updated image', async () => {
  const wrapper = shallowMount(ThumbnailCropper, { localVue, mocks, propsData, stubs })
  const model = new Model(wrapper)
  await model.stubRefs()

  await model.slider.setZoom(50)
  expect(model.component.$refs.cropper.setZoom).toHaveBeenCalledWith(0.5)

  await model.cropper.setCrop({ zoom: 0.5, points: ['1', '2', '3', '4'], orientation: 1 })
  expect(wrapper.emitted().update![0][0]).toEqual({
    ...propsData.image,
    scale: 0.5,
    x: 1,
    y: 2
  })
})

it('binds crop when receiving a new image', async () => {
  const wrapper = shallowMount(ThumbnailCropper, { localVue, mocks, propsData, stubs })
  const model = new Model(wrapper)

  await model.stubRefs()

  await wrapper.setProps({
    image: buildAnnotationClassImagePayload({
      original_image_url: 'new',
      x: 5,
      y: 10,
      scale: 20
    })
  })

  expect(model.component.$refs.cropper.bind).toHaveBeenCalledWith({
    points: ['5', '10', '13', '18'],
    url: 'new',
    zoom: 20
  })
})

it('requests result from cropper component when data updates', async () => {
  const wrapper = shallowMount(ThumbnailCropper, { localVue, mocks, propsData, stubs })
  const model = new Model(wrapper)
  await model.stubRefs()

  await model.cropper.setCrop({ zoom: 0.5, points: ['1', '2', '3', '4'], orientation: 1 })
  expect(model.component.$refs.cropper.result).toHaveBeenCalled()
})
