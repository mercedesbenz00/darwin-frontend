import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { buildDatasetReportPayload } from 'test/unit/factories'

import DatasetProgressSection from '@/components/Dataset/DatasetDetail/Overview/DatasetProgressSection.vue'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const report = buildDatasetReportPayload({
    id: 1,
    progress: 0.5,
    item_count: 3,
    annotator_count: 4,
    items_by_status: [
      { status: DatasetItemStatus.uploading, count: 1 },
      { status: DatasetItemStatus.new, count: 2 },
      { status: DatasetItemStatus.annotate, count: 3 },
      { status: DatasetItemStatus.review, count: 4 },
      { status: DatasetItemStatus.complete, count: 5 }
    ]
  })
  const stubs: Stubs = { 'progress-chart': true }
  const propsData = { report }
  const wrapper = shallowMount(DatasetProgressSection, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
