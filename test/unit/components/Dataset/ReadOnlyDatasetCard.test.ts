import { createLocalVue, shallowMount } from '@vue/test-utils'

import { buildDatasetPayload } from 'test/unit/factories'

import ReadOnlyDatasetCard from '@/components/Dataset/ReadOnlyDatasetCard.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', () => {})
localVue.directive('lazy', () => {})

const dataset = buildDatasetPayload({
  id: 1,
  active: true,
  thumbnails: ['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6'],
  progress: 0.5,
  num_images: 16,
  num_videos: 1,
  num_classes: 6,
  num_annotations: 1000,
  name: 'Smart Fume Hood Segmentation and Direction',
  inserted_at: '2019-08-12T17:56:54',
  updated_at: '2019-08-12T17:56:54'
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ReadOnlyDatasetCard, { localVue, propsData: { data: dataset } })
  expect(wrapper).toMatchSnapshot()
})
