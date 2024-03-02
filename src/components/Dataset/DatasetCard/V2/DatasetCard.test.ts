import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueLazyload from 'vue-lazyload'

import { buildDatasetPayload } from 'test/unit/factories'
import { Transition } from 'test/unit/stubs'

import DatasetCardV2 from '@/components/Dataset/DatasetCard/V2/DatasetCard.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { DatasetPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(VueLazyload)
localVue.directive('tooltip', () => {})
localVue.directive('click-outside', clickOutsideDirective)

const dataset = buildDatasetPayload({
  id: 1,
  owner_id: 1,
  active: true,
  thumbnails: ['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6'],
  work_size: 30,
  slug: 'smart-fume-hood-segmentation-and-direction',
  public: false,
  progress: 0.0,
  num_images: 16,
  num_videos: 1,
  num_classes: 6,
  num_annotations: 1000,
  name: 'Smart Fume Hood Segmentation and Direction',
  inserted_at: '2019-08-12T17:56:54',
  updated_at: '2019-08-12T17:56:54'
})

let propsData: {
  dataset: DatasetPayload
}

const stubs: Stubs = { 'router-link': true, Transition }
const mocks = { $can: () => true }

beforeEach(() => {
  propsData = { dataset: dataset }
})

it('matches snapshot', async () => {
  const wrapper = shallowMount(DatasetCardV2, { localVue, propsData, stubs, mocks })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when progress > 0%', async () => {
  propsData.dataset.progress = 0.5
  const wrapper = shallowMount(DatasetCardV2, { localVue, propsData, stubs, mocks })
  await flushPromises()
  expect(wrapper).toMatchSnapshot()
})
