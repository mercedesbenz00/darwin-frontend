import { createLocalVue, shallowMount } from '@vue/test-utils'

import DatasetItemStatusComponent from '@/components/DatasetManagement/Status/DatasetItemStatus.vue'
import { DatasetItemStatus } from '@/store/types'

const localVue = createLocalVue()

const statuses: DatasetItemStatus[] = [
  DatasetItemStatus.annotate,
  DatasetItemStatus.archived,
  DatasetItemStatus.complete,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.review,
  DatasetItemStatus.uploading
]

statuses.forEach(status => {
  it(`matches snapshot for dataset item of status '${status}'`, () => {
    const wrapper = shallowMount(DatasetItemStatusComponent, { localVue, propsData: { status } })
    expect(wrapper.element).toMatchSnapshot()
  })
})
