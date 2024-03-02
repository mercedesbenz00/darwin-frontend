import { shallowMount } from '@vue/test-utils'

import { DatasetItemCountsPayload } from '@/store/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'

import StatusFilter from './StatusFilter.vue'

const propsData: {
  options: DatasetItemStatus[],
  hiddenOptions: DatasetItemStatus[],
  positiveOptions: DatasetItemStatus[],
  negativeOptions: DatasetItemStatus[],
  counts: DatasetItemCountsPayload
} = {
  options: [],
  hiddenOptions: [],
  counts: {
    commented_item_count: 1,
    item_count: 1,
    unfiltered_item_count: 1,
    status_counts: [],
    class_counts: []
  },
  positiveOptions: [],
  negativeOptions: []
}

it('matches snapshot with everything above fold', () => {
  propsData.options = Object.values(DatasetItemStatus)
  const wrapper = shallowMount(StatusFilter, { propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with some things selected', () => {
  propsData.options = Object.values(DatasetItemStatus)
  propsData.positiveOptions = [DatasetItemStatus.new, DatasetItemStatus.annotate],
  propsData.negativeOptions = [DatasetItemStatus.archived]
  const wrapper = shallowMount(StatusFilter, { propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with things below fold', () => {
  propsData.options = [DatasetItemStatus.new, DatasetItemStatus.archived]
  propsData.hiddenOptions = [DatasetItemStatus.uploading, DatasetItemStatus.processing]
  const wrapper = shallowMount(StatusFilter, { propsData })
  expect(wrapper).toMatchSnapshot()
})
