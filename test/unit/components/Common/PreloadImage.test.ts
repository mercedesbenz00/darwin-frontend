import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetImagePayload, buildImagePayload } from 'test/unit/factories'

import PreloadImage from '@/components/Common/PreloadImage.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot', () => {
  const propsData = { images: [] }
  const wrapper = shallowMount(PreloadImage, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('preloads 3 images', async () => {
  const images = [
    buildDatasetImagePayload({ id: 1, seq: 1 }),
    buildDatasetImagePayload({ id: 2, seq: 2 }),
    buildDatasetImagePayload({ id: 3, seq: 3 })
  ]
  const propsData = { images }

  shallowMount(PreloadImage, { localVue, propsData, store })
  expect(store.dispatch).toBeCalledWith('workview/loadItemImageData', images[0])
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/loadItemImageData', images[1])
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/loadItemImageData', images[2])
  expect(store.dispatch).toHaveBeenCalledTimes(3)
})

it('preloads tiled images', async () => {
  const images = [
    buildDatasetImagePayload({ id: 1, seq: 1, image: buildImagePayload({ format: 'tiled' }) }),
    buildDatasetImagePayload({ id: 2, seq: 2, image: buildImagePayload({ format: 'tiled' }) }),
    buildDatasetImagePayload({ id: 3, seq: 3, image: buildImagePayload({ format: 'tiled' }) })
  ]
  const propsData = { images }

  shallowMount(PreloadImage, { localVue, propsData, store })
  expect(store.dispatch).toBeCalledWith('workview/loadTiledImageData', images[0])
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/loadTiledImageData', images[1])
  await flushPromises()
  expect(store.dispatch).toBeCalledWith('workview/loadTiledImageData', images[2])
  expect(store.dispatch).toHaveBeenCalledTimes(3)
})
